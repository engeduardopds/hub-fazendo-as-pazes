exports.handler = async function(event, context) {
    console.log(">>> INÍCIO DA FUNÇÃO CREATE_PAYMENT <<<");

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
        console.log("Dados recebidos do Frontend:", JSON.stringify(data));
        
        const { customer, payment } = data;

        if (!customer || !customer.cpf || !customer.name) {
            throw new Error('Dados do cliente incompletos (CPF e Nome são obrigatórios).');
        }

        const API_URL = 'https://sandbox.asaas.com/api/v3';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) { 
            console.error("ERRO CRÍTICO: Chave de API não encontrada nas variáveis de ambiente.");
            throw new Error('Configuração de API Key ausente.'); 
        }

        const fetchAsaas = async (endpoint, method, bodyContent) => {
            console.log(`Chamando Asaas [${method}] ${endpoint}...`);
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json', 'access_token': API_KEY }
            };
            if (bodyContent) { options.body = JSON.stringify(bodyContent); }

            const response = await fetch(`${API_URL}${endpoint}`, options);
            const json = await response.json();

            if (!response.ok) {
                console.error(`Erro na resposta do Asaas [${endpoint}]:`, JSON.stringify(json));
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro na API Asaas';
                throw new Error(`Asaas (${endpoint}): ${errorMsg}`);
            }
            console.log(`Sucesso Asaas [${endpoint}]:`, JSON.stringify(json));
            return json;
        };

        // 1. Cliente
        let customerId = null;
        const cpfLimpo = customer.cpf.replace(/\D/g, '');
        console.log(`Buscando cliente com CPF limpo: ${cpfLimpo}`);
        
        const searchCustomer = await fetchAsaas(`/customers?cpfCnpj=${cpfLimpo}`, 'GET');

        if (searchCustomer.data && searchCustomer.data.length > 0) {
            customerId = searchCustomer.data[0].id;
            console.log("Cliente JÁ EXISTE. ID:", customerId);
        } else {
            console.log("Cliente NÃO EXISTE. Criando novo...");
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
            console.log("Cliente CRIADO. ID:", customerId);
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

        console.log("Payload da Cobrança:", JSON.stringify(paymentPayload));
        const paymentRes = await fetchAsaas('/payments', 'POST', paymentPayload);

        console.log(">>> FIM DA EXECUÇÃO COM SUCESSO <<<");
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: paymentRes.invoiceUrl })
        };

    } catch (error) {
        console.error('>>> ERRO FATAL NO BACKEND:', error);
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message || "Erro interno",
                details: error.toString() // Envia detalhes para o frontend ajudar no debug
            })
        };
    }
};
```
```eof
