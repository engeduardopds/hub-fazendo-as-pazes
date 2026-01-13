const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Apenas permite requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { value, description } = JSON.parse(event.body);

        // Configuração da API do Asaas
        // IMPORTANTE: A chave API deve estar nas Variáveis de Ambiente do Netlify (ASAAS_API_KEY)
        // URL de Sandbox (Teste): [https://sandbox.asaas.com/api/v3/paymentLinks](https://sandbox.asaas.com/api/v3/paymentLinks)
        // URL de Produção: [https://www.asaas.com/api/v3/paymentLinks](https://www.asaas.com/api/v3/paymentLinks)
        const ASAAS_URL = '[https://www.asaas.com/api/v3/paymentLinks](https://www.asaas.com/api/v3/paymentLinks)';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            throw new Error('Chave de API não configurada no servidor.');
        }

        // Payload para criar o Link de Pagamento
        // billingType: 'UNDEFINED' permite que o usuário escolha (Pix, Boleto, Cartão) na tela do Asaas
        // chargeType: 'INSTALLMENT' habilita parcelamento se configurado na conta
        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: value,
            billingType: "UNDEFINED", 
            chargeType: "DETACHED", // Cobrança avulsa
            dueDateLimitDays: 3, // Link expira em 3 dias
            maxInstallmentCount: 12 // Permite até 12x (os juros dependem da config da sua conta Asaas)
        };

        const response = await fetch(ASAAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors ? data.errors[0].description : 'Erro na API Asaas');
        }

        // Sucesso: Retorna a URL do pagamento
        return {
            statusCode: 200,
            body: JSON.stringify({ paymentUrl: data.url })
        };

    } catch (error) {
        console.error('Erro na função create_payment:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};