exports.handler = async function(event, context) {
    // Cabeçalhos de segurança e CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Responde a requisições de pre-flight (CORS)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Apenas POST é permitido
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
    }

    try {
        if (!event.body) {
            throw new Error('Corpo da requisição vazio.');
        }

        const data = JSON.parse(event.body);
        const { customer, payment } = data;

        // Validações básicas
        if (!customer || !customer.cpf || !customer.name) {
            throw new Error('Dados do cliente incompletos (CPF e Nome são obrigatórios).');
        }
        if (!payment || !payment.value) {
            throw new Error('Dados do pagamento incompletos.');
        }

        // Configuração da API Asaas (Sandbox)
        // Mude para 'https://www.asaas.com/api/v3' quando for para produção
        const API_URL = 'https://sandbox.asaas.com/api/v3';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            throw new Error('Configuração de API Key ausente no servidor.');
        }

        // Função auxiliar para chamadas à API
        const fetchAsaas = async (endpoint, method, bodyContent) => {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': API_KEY
                }
            };
            if (bodyContent) {
                options.body = JSON.stringify(bodyContent);
            }

            const response = await fetch(`${API_URL}${endpoint}`, options);
            const json = await response.json();

            if (!response.ok) {
                // Tenta extrair mensagem de erro detalhada
                const errorMsg = json.errors && json.errors[0] ? json.errors[0].description : 'Erro desconhecido na API';
                throw new Error(`Asaas (${endpoint}): ${errorMsg}`);
            }
            return json;
        };

        // PASSO 1: Buscar ou Criar Cliente
        let customerId = null;
        console.log(`Buscando cliente CPF: ${customer.cpf}`);
        
        const searchCustomer = await fetchAsaas(`/customers?cpfCnpj=${customer.cpf}`, 'GET');

        if (searchCustomer.data && searchCustomer.data.length > 0) {
            customerId = searchCustomer.data[0].id;
            console.log("Cliente encontrado:", customerId);
        } else {
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
            console.log("Cliente criado:", customerId);
        }

        // PASSO 2: Criar a Cobrança (POST /payments)
        // Calcula data de vencimento (Hoje + 2 dias)
        const today = new Date();
        today.setDate(today.getDate() + 2);
        const dueDate = today.toISOString().split('T')[0];

        // Prepara o payload da cobrança
        const paymentPayload = {
            customer: customerId,
            billingType: payment.billingType, // PIX, CREDIT_CARD ou UNDEFINED
            value: parseFloat(payment.value),
            dueDate: dueDate,
            description: payment.description,
            // Se for cartão de crédito parcelado, define as parcelas
            // Nota: installmentValue é calculado automaticamente pelo Asaas se omitido, 
            // mas enviar ajuda a garantir precisão se o valor total tiver dízimas.
            // Para simplicidade, deixamos o Asaas calcular baseado no installmentCount e value total.
        };

        // Adiciona campos de parcelamento apenas se for Crédito e > 1x
        if (payment.billingType === 'CREDIT_CARD' && payment.installmentCount > 1) {
            paymentPayload.installmentCount = payment.installmentCount;
            paymentPayload.installmentValue = parseFloat(payment.value) / payment.installmentCount;
        }

        console.log("Criando cobrança...", JSON.stringify(paymentPayload));
        const paymentResponse = await fetchAsaas('/payments', 'POST', paymentPayload);

        // Sucesso! Retorna a URL da fatura (invoiceUrl)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: paymentResponse.invoiceUrl })
        };

    } catch (error) {
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
```
```eof
