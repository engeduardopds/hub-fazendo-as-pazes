// Usamos fetch nativo (Node 18+)

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

        // Recebemos o billingType (PIX, CREDIT_CARD, DEBIT_CARD) do frontend
        const { value, description, billingType, installmentCount } = JSON.parse(event.body);
        const valorNumerico = parseFloat(value);

        const ASAAS_URL = 'https://sandbox.asaas.com/api/v3/paymentLinks';
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            console.error("ERRO: ASAAS_API_KEY não encontrada.");
            throw new Error('Configuração de API Key ausente no servidor.');
        }

        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: valorNumerico,
            // Se o site mandar 'PIX', trava no Pix. Se mandar 'CREDIT_CARD', trava no cartão.
            // Se não mandar nada, usa UNDEFINED (escolha livre).
            billingType: billingType || "UNDEFINED", 
            chargeType: "DETACHED",   
            dueDateLimitDays: 3,
            // No link de pagamento avulso (DETACHED), o maxInstallmentCount define o limite.
            // Se o cliente escolheu parcelar no site, nós já calculamos os juros no valor total.
            // Aqui permitimos que ele selecione as parcelas na interface do Asaas até o limite que escolheu.
            maxInstallmentCount: installmentCount || 1 
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
