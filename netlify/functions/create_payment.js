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
        const ASAAS_URL = 'https://www.asaas.com/api/v3/paymentLinks'; // Use 'sandbox.asaas.com' para testes
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            throw new Error('Chave de API não configurada no servidor.');
        }

        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: value,
            billingType: "UNDEFINED", // Permite Pix, Boleto, Cartão
            chargeType: "DETACHED",
            dueDateLimitDays: 3,
            maxInstallmentCount: 12
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
