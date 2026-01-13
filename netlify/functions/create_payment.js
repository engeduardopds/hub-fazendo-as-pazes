// Removemos o require('node-fetch') pois o Node 18+ já tem fetch nativo

exports.handler = async function(event, context) {
    // 1. Cabeçalhos para permitir CORS (caso teste localmente ou de outro domínio)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // 2. Tratamento para requisições OPTIONS (Pre-flight do browser)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
    }

    try {
        if (!event.body) {
            throw new Error('Corpo da requisição vazio.');
        }

        const { value, description } = JSON.parse(event.body);

        // 3. Configurações do Asaas (Sandbox)
        const ASAAS_URL = 'https://sandbox.asaas.com/api/v3/paymentLinks';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            console.error("ERRO CRÍTICO: Variável ASAAS_API_KEY não encontrada no Netlify.");
            throw new Error('Configuração de API Key ausente no servidor.');
        }

        // 4. Cria o Payload
        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: parseFloat(value), // Garante que é número
            billingType: "UNDEFINED",
            chargeType: "DETACHED",
            dueDateLimitDays: 3,
            maxInstallmentCount: 12
        };

        console.log("Enviando payload para Asaas:", JSON.stringify(payload));

        // 5. Chamada ao Asaas usando fetch nativo
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
            console.error('Resposta de Erro do Asaas:', JSON.stringify(data));
            // Tenta extrair a mensagem de erro específica do Asaas
            const errorMsg = data.errors && data.errors[0] ? data.errors[0].description : 'Erro desconhecido na API do Asaas';
            throw new Error(`Asaas recusou: ${errorMsg}`);
        }

        // 6. Sucesso
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: data.url })
        };

    } catch (error) {
        console.error('Erro na função create_payment:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || "Erro interno no servidor" })
        };
    }
};
