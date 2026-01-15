exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

    try {
        const { paymentId } = JSON.parse(event.body);
        if (!paymentId) throw new Error('Payment ID ausente.');

        const API_KEY = process.env.ASAAS_API_KEY;
        const response = await fetch(`https://sandbox.asaas.com/api/v3/payments/${paymentId}`, {
            method: 'GET',
            headers: { 'access_token': API_KEY }
        });

        const data = await response.json();
        
        // Retorna o status oficial (PENDING, RECEIVED, CONFIRMED, OVERDUE)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: data.status })
        };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
}
