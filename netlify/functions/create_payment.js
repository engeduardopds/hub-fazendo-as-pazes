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
        if (!event.body) throw new Error('Corpo da requisição vazio.');

        const data = JSON.parse(event.body);
        const { customer, payment } = data;

        // Validação básica
        if (!customer || !customer.cpf || !customer.name) {
            throw new Error('Dados do cliente incompletos (CPF e Nome são obrigatórios).');
        }

        // Configuração da API (Sandbox)
        // Certifique-se de que a variável ASAAS_API_KEY está no Netlify
        const API_URL = 'https://sandbox.asaas.com/api/v3';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) throw new Error('Chave de API não configurada no servidor.');

        // Função auxiliar para fetch
        const fetchAsaas = async (endpoint, method, bodyContent) => {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': API_KEY
                }
            };
            if (bodyContent) options.body = JSON.stringify(bodyContent);

            console.log(`Enviando para Asaas [${method} ${endpoint}]`);
            const response = await fetch(`${API_URL}${endpoint}`, options);
            const json = await response.json();

            if (!response.ok) {
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro desconhecido na API Asaas';
                console.error('Erro Asaas:', JSON.stringify(json));
                throw new Error(errorMsg);
            }
            return json;
        };

        // 1. Buscar ou Criar Cliente
        let customerId = null;
        const cpfLimpo = customer.cpf.replace(/\D/g, '');
        
        // Busca cliente pelo CPF
        const searchRes = await fetchAsaas(`/customers?cpfCnpj=${cpfLimpo}`, 'GET');

        if (searchRes.data && searchRes.data.length > 0) {
            customerId = searchRes.data[0].id;
        } else {
            // Cria novo cliente
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

        // 2. Criar a Cobrança
        const today = new Date();
        today.setDate(today.getDate() + 2); // Vencimento padrão: +2 dias
        const dueDate = today.toISOString().split('T')[0];

        // Mapeia o tipo de pagamento
        // A API de /payments aceita: BOLETO, CREDIT_CARD, PIX, UNDEFINED
        let billingTypeAPI = 'UNDEFINED';
        if (payment.billingType === 'PIX') billingTypeAPI = 'PIX';
        if (payment.billingType === 'CREDIT_CARD') billingTypeAPI = 'CREDIT_CARD';
        // Se for DEBIT_CARD, enviamos UNDEFINED para que o cliente escolha na fatura (ou CREDIT_CARD se o gateway processar junto)
        
        const paymentPayload = {
            customer: customerId,
            billingType: billingTypeAPI,
            value: parseFloat(payment.value),
            dueDate: dueDate,
            description: payment.description
        };

        // Adiciona parcelamento se for cartão e > 1x
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
            body: JSON.stringify({ error: error.message || "Erro interno no servidor", details: error.toString() })
        };
    }
};
```
```eof
