exports.handler = async function(event, context) {
    // LOG INICIAL
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
            console.error("ERRO: Corpo da requisição vazio.");
            throw new Error('Corpo da requisição vazio.');
        }

        // LOG DOS DADOS RECEBIDOS (Ocultando dados sensíveis se necessário)
        const data = JSON.parse(event.body);
        console.log("1. Dados recebidos do Site:", JSON.stringify(data));

        const { customer, payment } = data;

        // Validação
        if (!customer || !customer.cpf || !customer.name) {
            console.error("ERRO: Dados do cliente incompletos.");
            throw new Error('Dados do cliente incompletos (CPF e Nome são obrigatórios).');
        }

        const API_URL = 'https://sandbox.asaas.com/api/v3';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            console.error("ERRO CRÍTICO: Chave API não encontrada nas variáveis.");
            throw new Error('Configuração de API Key ausente.');
        }

        // Função auxiliar de Fetch com Log
        const fetchAsaas = async (endpoint, method, bodyContent) => {
            console.log(`-> Enviando para Asaas [${method}] ${endpoint}`);
            
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json', 'access_token': API_KEY }
            };
            if (bodyContent) options.body = JSON.stringify(bodyContent);

            const response = await fetch(`${API_URL}${endpoint}`, options);
            const json = await response.json();

            // Log da Resposta (Ajuda a ver o erro exato do Asaas)
            console.log(`<- Resposta Asaas [${endpoint}]:`, JSON.stringify(json));

            if (!response.ok) {
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro desconhecido na API Asaas';
                throw new Error(`Asaas recusou (${endpoint}): ${errorMsg}`);
            }
            return json;
        };

        // 1. Cliente
        let customerId = null;
        const cpfLimpo = customer.cpf.replace(/\D/g, '');
        console.log(`2. Buscando cliente CPF: ${cpfLimpo}`);
        
        const searchCustomer = await fetchAsaas(`/customers?cpfCnpj=${cpfLimpo}`, 'GET');

        if (searchCustomer.data && searchCustomer.data.length > 0) {
            customerId = searchCustomer.data[0].id;
            console.log("   Cliente encontrado. ID:", customerId);
        } else {
            console.log("   Cliente não existe. Criando novo...");
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
            console.log("   Novo cliente criado. ID:", customerId);
        }

        // 2. Cobrança
        console.log("3. Preparando cobrança...");
        const today = new Date();
        today.setDate(today.getDate() + 2);
        const dueDate = today.toISOString().split('T')[0];

        // Normalização do BillingType
        let billingTypeAPI = 'UNDEFINED';
        if (payment.billingType === 'PIX') billingTypeAPI = 'PIX';
        if (payment.billingType === 'CREDIT_CARD') billingTypeAPI = 'CREDIT_CARD';

        const paymentPayload = {
            customer: customerId,
            billingType: billingTypeAPI, 
            value: parseFloat(payment.value),
            dueDate: dueDate,
            description: payment.description
        };

        if (payment.billingType === 'CREDIT_CARD' && payment.installmentCount > 1) {
            paymentPayload.installmentCount = payment.installmentCount;
            paymentPayload.installmentValue = parseFloat(payment.value) / payment.installmentCount;
        }

        console.log("   Payload da Cobrança:", JSON.stringify(paymentPayload));
        const paymentRes = await fetchAsaas('/payments', 'POST', paymentPayload);

        console.log(">>> SUCESSO! Fatura criada:", paymentRes.invoiceUrl);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: paymentRes.invoiceUrl })
        };

    } catch (error) {
        console.error('>>> ERRO FATAL:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message || "Erro interno",
                details: error.toString() // Envia detalhes para o frontend
            })
        };
    }
};
```
```eof
