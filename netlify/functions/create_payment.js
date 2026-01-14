exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
    }

    try {
        if (!event.body) { throw new Error('Corpo da requisição vazio.'); }

        const data = JSON.parse(event.body);
        const { customer, payment } = data;

        if (!customer || !customer.cpf || !customer.name) {
            throw new Error('Dados do cliente incompletos (CPF e Nome são obrigatórios).');
        }

        const API_URL = '[https://sandbox.asaas.com/api/v3](https://sandbox.asaas.com/api/v3)';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) { throw new Error('Configuração de API Key ausente.'); }

        const fetchAsaas = async (endpoint, method, bodyContent) => {
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json', 'access_token': API_KEY }
            };
            if (bodyContent) { options.body = JSON.stringify(bodyContent); }

            const response = await fetch(`${API_URL}${endpoint}`, options);
            const json = await response.json();

            if (!response.ok) {
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro na API Asaas';
                throw new Error(`Asaas (${endpoint}): ${errorMsg}`);
            }
            return json;
        };

        // 1. Cliente
        let customerId = null;
        const cpfLimpo = customer.cpf.replace(/\D/g, '');
        const searchCustomer = await fetchAsaas(`/customers?cpfCnpj=${cpfLimpo}`, 'GET');

        if (searchCustomer.data && searchCustomer.data.length > 0) {
            customerId = searchCustomer.data[0].id;
        } else {
            const newCustomer = await fetchAsaas('/customers', 'POST', {
                name: customer.name,
                cpfCnpj: cpfLimpo,
                email: customer.email,
                mobilePhone: customer.phone,
                address: customer.address,
                addressNumber: customer.addressNumber,
                complement: customer.complement,
                province: customer.bairro,
                postalCode: customer.cep
            });
            customerId = newCustomer.id;
        }

        // 2. Cobrança
        const today = new Date();
        today.setDate(today.getDate() + 2);
        const dueDate = today.toISOString().split('T')[0];

        const paymentPayload = {
            customer: customerId,
            billingType: payment.billingType, 
            value: parseFloat(payment.value),
            dueDate: dueDate,
            description: payment.description
        };

        if (payment.billingType === 'CREDIT_CARD' && payment.installmentCount > 1) {
            paymentPayload.installmentCount = payment.installmentCount;
            paymentPayload.installmentValue = parseFloat(payment.value) / payment.installmentCount;
        }

        const paymentRes = await fetchAsaas('/payments', 'POST', paymentPayload);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: paymentRes.invoiceUrl })
        };

    } catch (error) {
        console.error('Erro Backend:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || "Erro interno" })
        };
    }
};
```
```eof
