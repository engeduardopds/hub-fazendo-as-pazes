exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { paymentId } = JSON.parse(event.body);
        const API_KEY = process.env.ASAAS_API_KEY;
        const API_URL = `https://sandbox.asaas.com/api/v3/payments/${paymentId}`;

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: { 'access_token': API_KEY }
        });

        const data = await response.json();

        // Status possíveis do Asaas: PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED...
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: data.status })
        };

    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
}
