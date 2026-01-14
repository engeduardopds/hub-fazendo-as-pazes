exports.handler = async function(event, context) {
    console.log(">>> INÍCIO DO PROCESSAMENTO DE PAGAMENTO <<<");

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
        if (!event.body) {
            console.error("Erro: Corpo da requisição vazio.");
            throw new Error('Corpo da requisição vazio.');
        }

        console.log("1. Dados recebidos (bruto):", event.body);
        const data = JSON.parse(event.body);
        const { customer, payment } = data;

        console.log("2. Cliente:", JSON.stringify(customer));
        console.log("3. Pagamento:", JSON.stringify(payment));

        if (!customer || !customer.cpf || !customer.name) {
            throw new Error('Dados do cliente incompletos (Nome e CPF são obrigatórios).');
        }

        const API_URL = 'https://sandbox.asaas.com/api/v3';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            console.error("ERRO CRÍTICO: Variável ASAAS_API_KEY não encontrada.");
            throw new Error('Configuração de API Key ausente no Netlify.');
        }

        // Função auxiliar de Fetch com Log
        const fetchAsaas = async (endpoint, method, bodyContent) => {
            console.log(`-> Chamando Asaas [${method}] ${endpoint}`);
            if (bodyContent) console.log("   Payload:", JSON.stringify(bodyContent));

            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json', 'access_token': API_KEY }
            };
            if (bodyContent) options.body = JSON.stringify(bodyContent);

            const response = await fetch(`${API_URL}${endpoint}`, options);
            const json = await response.json();

            console.log(`<- Resposta Asaas [${endpoint}]:`, JSON.stringify(json));

            if (!response.ok) {
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro desconhecido na API Asaas';
                throw new Error(`Asaas recusou (${endpoint}): ${errorMsg}`);
            }
            return json;
        };

        // 1. Buscar Cliente
        let customerId = null;
        const cpfLimpo = customer.cpf.replace(/\D/g, '');
        const searchRes = await fetchAsaas(`/customers?cpfCnpj=${cpfLimpo}`, 'GET');

        if (searchRes.data && searchRes.data.length > 0) {
            customerId = searchRes.data[0].id;
            console.log("   Cliente encontrado:", customerId);
        } else {
            console.log("   Cliente não encontrado. Criando novo...");
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
            console.log("   Novo cliente criado:", customerId);
        }

        // 2. Criar Cobrança
        const today = new Date();
        today.setDate(today.getDate() + 2);
        const dueDate = today.toISOString().split('T')[0];

        // Mapeamento seguro de BillingType
        let validBillingType = 'UNDEFINED';
        if (payment.billingType === 'PIX') validBillingType = 'PIX';
        if (payment.billingType === 'CREDIT_CARD') validBillingType = 'CREDIT_CARD';
        // DEBIT_CARD deve ser tratado como UNDEFINED na criação para permitir escolha na fatura, 
        // ou CREDIT_CARD se o gateway processar débito como crédito à vista. 
        // Vamos usar UNDEFINED para segurança se não for Pix nem Crédito.

        const paymentPayload = {
            customer: customerId,
            billingType: validBillingType,
            value: parseFloat(payment.value),
            dueDate: dueDate,
            description: payment.description
        };

        if (validBillingType === 'CREDIT_CARD' && payment.installmentCount > 1) {
            paymentPayload.installmentCount = payment.installmentCount;
            paymentPayload.installmentValue = parseFloat(payment.value) / payment.installmentCount;
        }

        const paymentRes = await fetchAsaas('/payments', 'POST', paymentPayload);

        console.log(">>> SUCESSO! Fatura criada:", paymentRes.invoiceUrl);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: paymentRes.invoiceUrl })
        };

    } catch (error) {
        console.error('>>> ERRO NO BACKEND:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message || "Erro interno no servidor",
                details: error.toString() 
            })
        };
    }
};
```
```eof
