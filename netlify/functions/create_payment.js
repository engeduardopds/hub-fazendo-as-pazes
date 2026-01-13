// Usamos fetch nativo (Node 18+)
// Se der erro de 'fetch is not defined', certifique-se de que o site no Netlify 
// está configurado para usar Node 18 em: Site settings > Build & deploy > Environment variables > AWS_LAMBDA_JS_RUNTIME = nodejs18.x

exports.handler = async function(event, context) {
    // Cabeçalhos padrão
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
            throw new Error('Corpo da requisição vazio.');
        }

        const { value, description } = JSON.parse(event.body);
        const valorNumerico = parseFloat(value);

        const ASAAS_URL = 'https://sandbox.asaas.com/api/v3/paymentLinks';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            console.error("ERRO: ASAAS_API_KEY não encontrada.");
            throw new Error('Configuração de API Key ausente no servidor.');
        }

        // PAYLOAD CORRIGIDO PARA PARCELAMENTO
        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: valorNumerico,
            billingType: "UNDEFINED", // Deixa o cliente escolher (Pix, Boleto, Cartão)
            chargeType: "DETACHED",   // OBRIGATÓRIO: Cobrança avulsa
            dueDateLimitDays: 3,
            maxInstallmentCount: 12   // Habilita até 12x (desde que a parcela mínima seja respeitada)
        };

        console.log("Enviando para Asaas:", JSON.stringify(payload));

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
            console.error('Erro Asaas:', JSON.stringify(data));
            // Captura a mensagem de erro exata do Asaas
            const errorMsg = data.errors && data.errors[0] ? data.errors[0].description : 'Erro desconhecido na API do Asaas';
            throw new Error(`Asaas recusou: ${errorMsg}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ paymentUrl: data.url })
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
