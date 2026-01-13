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
        
        // Dados do Cliente e Compra
        const { customer, payment } = data;
        
        // Validações básicas
        if (!customer.cpf || !customer.name) throw new Error('Dados do cliente incompletos.');
        
        // Configuração API
        const API_URL = 'https://sandbox.asaas.com/api/v3';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) throw new Error('Chave de API não configurada.');

        const fetchAsaas = async (endpoint, method, body) => {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': API_KEY
                },
                body: body ? JSON.stringify(body) : null
            });
            const json = await res.json();
            if (!res.ok) {
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro na API';
                throw new Error(errorMsg);
            }
            return json;
        };

        // 1. Buscar se cliente já existe pelo CPF
        console.log("Buscando cliente...", customer.cpf);
        const searchRes = await fetchAsaas(`/customers?cpfCnpj=${customer.cpf}`, 'GET');
        let customerId = null;

        if (searchRes.data && searchRes.data.length > 0) {
            // Cliente existe, atualiza dados se necessário
            customerId = searchRes.data[0].id;
            console.log("Cliente encontrado:", customerId);
            // Opcional: Atualizar dados do cliente aqui se desejar
        } else {
            // Cliente não existe, cria novo
            console.log("Criando novo cliente...");
            const newCustomer = await fetchAsaas('/customers', 'POST', {
                name: customer.name,
                cpfCnpj: customer.cpf,
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
        console.log("Criando cobrança para:", customerId);
        
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 2); // Vencimento em 2 dias
        const dueDateStr = dueDate.toISOString().split('T')[0];

        const paymentPayload = {
            customer: customerId,
            billingType: payment.billingType, // PIX, CREDIT_CARD, DEBIT_CARD
            value: payment.value,
            dueDate: dueDateStr,
            description: payment.description,
            // Se for cartão parcelado, configura as parcelas
            ...(payment.billingType === 'CREDIT_CARD' && payment.installmentCount > 1 ? {
                installmentCount: payment.installmentCount,
                installmentValue: payment.value / payment.installmentCount // Valor total dividido pelas parcelas
            } : {})
        };

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
            body: JSON.stringify({ error: error.message || "Erro interno no servidor" })
        };
    }
};
```
```eof
