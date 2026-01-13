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
        if (!event.body) {
            throw new Error('Corpo da requisição vazio.');
        }

        const { value, description } = JSON.parse(event.body);
        
        const valorNumerico = parseFloat(value);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            throw new Error('Valor inválido para pagamento.');
        }

        // CORREÇÃO: URL limpa, sem formatação de markdown
        const ASAAS_URL = 'https://sandbox.asaas.com/api/v3/paymentLinks';
        
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            throw new Error('Configuração de API Key ausente no servidor.');
        }

        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: valorNumerico,
            billingType: "UNDEFINED", 
            chargeType: "DETACHED",
            dueDateLimitDays: 3
        };

        console.log("Enviando para Asaas:", JSON.stringify(payload));

        // Usa o fetch global (Node 18+)
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
