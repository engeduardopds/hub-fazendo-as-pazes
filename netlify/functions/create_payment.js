exports.handler = async function(event, context) {
    // Permite acesso de qualquer origem (CORS) para evitar erros de bloqueio
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

        // Recebemos apenas o essencial: Valor final e Descrição
        // O valor já vem com juros calculados pelo frontend se for o caso
        const { value, description } = JSON.parse(event.body);
        
        const valorNumerico = parseFloat(value);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            throw new Error('Valor inválido para pagamento.');
        }

        const ASAAS_URL = 'https://sandbox.asaas.com/api/v3/paymentLinks';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            throw new Error('Configuração de API Key ausente no servidor.');
        }

        // Payload Simplificado e Robusto
        // billingType: "UNDEFINED" -> Deixa o cliente escolher (Pix, Cartão, Boleto) na tela do Asaas
        // chargeType: "DETACHED" -> Obrigatório para link de pagamento
        // maxInstallmentCount: 12 -> Permite que o cliente parcele lá no Asaas se quiser (o valor total já garante o recebimento correto)
        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: valorNumerico,
            billingType: "UNDEFINED", 
            chargeType: "DETACHED",
            dueDateLimitDays: 3,
            maxInstallmentCount: 12 
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
