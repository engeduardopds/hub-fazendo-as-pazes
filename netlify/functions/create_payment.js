const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. Segurança: Só aceita pedidos do tipo POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        // 2. Recebe os dados do carrinho (Frontend)
        const { value, description } = JSON.parse(event.body);

        // 3. Configurações do Asaas
        // IMPORTANTE: URL do SANDBOX para testes
        const ASAAS_URL = 'https://sandbox.asaas.com/api/v3/paymentLinks';
        
        // A chave deve estar nas Variáveis de Ambiente do Netlify (Site settings > Environment variables)
        const API_KEY = process.env.ASAAS_API_KEY;

        if (!API_KEY) {
            console.error("Erro: ASAAS_API_KEY não encontrada.");
            throw new Error('Configuração de servidor incompleta (Falta API Key).');
        }

        // 4. Cria o Link de Pagamento
        const payload = {
            name: "Pedido Hub Fazendo as Pazes",
            description: description || "Compra no Hub",
            value: value, // Valor total do carrinho
            billingType: "UNDEFINED", // Permite ao usuário escolher (Pix, Cartão, Boleto)
            chargeType: "DETACHED",   // Cobrança avulsa (Link)
            dueDateLimitDays: 3,      // O link vence em 3 dias
            maxInstallmentCount: 12   // Permite parcelar em até 12x
        };

        console.log("Enviando para Asaas Sandbox:", JSON.stringify(payload));

        const response = await fetch(ASAAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // 5. Verifica se deu erro no Asaas
        if (!response.ok) {
            console.error('Erro Asaas:', data);
            const errorMsg = data.errors && data.errors[0] ? data.errors[0].description : 'Erro desconhecido no Asaas';
            throw new Error(errorMsg);
        }

        // 6. Sucesso: Devolve o Link para o site
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
```
```
