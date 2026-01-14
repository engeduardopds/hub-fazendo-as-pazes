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

        console.log("1. Recebido:", event.body); // Log para debug

        const data = JSON.parse(event.body);
        const { customer, payment } = data;

        // Validações básicas
        if (!customer || !customer.cpf || !customer.name) {
            throw new Error('Dados do cliente incompletos (CPF e Nome obrigatórios).');
        }

        // Configuração API (Sandbox)
        const API_URL = 'https://sandbox.asaas.com/api/v3';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) throw new Error('Chave API não configurada no servidor.');

        // Função auxiliar de Fetch
        const fetchAsaas = async (endpoint, method, bodyContent) => {
            console.log(`-> Asaas ${method} ${endpoint}`);
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': API_KEY
                }
            };
            if (bodyContent) options.body = JSON.stringify(bodyContent);

            const response = await fetch(`${API_URL}${endpoint}`, options);
            const json = await response.json();

            if (!response.ok) {
                console.error("Erro Asaas:", JSON.stringify(json));
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro na API Asaas';
                throw new Error(`${errorMsg}`);
            }
            return json;
        };

        // 1. Cliente: Buscar ou Criar
        let customerId = null;
        const cpfLimpo = customer.cpf.replace(/\D/g, '');
        
        const searchRes = await fetchAsaas(`/customers?cpfCnpj=${cpfLimpo}`, 'GET');

        if (searchRes.data && searchRes.data.length > 0) {
            customerId = searchRes.data[0].id;
            console.log("Cliente existente:", customerId);
        } else {
            console.log("Criando novo cliente...");
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
            console.log("Cliente criado:", customerId);
        }

        // 2. Criar Cobrança
        const today = new Date();
        today.setDate(today.getDate() + 2); // Vencimento +2 dias
        const dueDate = today.toISOString().split('T')[0];

        // Mapeamento de BillingType
        // UNDEFINED permite ao usuário escolher na fatura se não for específico
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

        // Adiciona parcelas SE for cartão e mais de 1x
        // Nota: A API de /payments cria parcelamento "real" se installmentCount for enviado.
        // Se quisermos apenas cobrar o valor total no cartão, não mandamos installmentCount
        // Mas como o cliente escolheu parcelas no site, mandamos para o Asaas configurar a fatura.
        if (payment.billingType === 'CREDIT_CARD' && payment.installmentCount > 1) {
            paymentPayload.installmentCount = payment.installmentCount;
            paymentPayload.installmentValue = parseFloat(payment.value) / payment.installmentCount;
        }

        console.log("Criando cobrança...", JSON.stringify(paymentPayload));
        const paymentRes = await fetchAsaas('/payments', 'POST', paymentPayload);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: paymentRes.invoiceUrl })
        };

    } catch (error) {
        console.error('Erro Fatal Backend:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message, details: error.toString() })
        };
    }
};
```
```eof
