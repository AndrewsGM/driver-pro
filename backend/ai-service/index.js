const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'ai-service' });
});

app.post('/analyze', (req, res) => {
    const { prompt } = req.body;
    console.log(`[AI Service] Analyzing prompt: ${prompt ? prompt.substring(0, 50) + '...' : 'No prompt'}`);

    // Simulated LLM delay
    setTimeout(() => {
        res.json({
            response: "Olá! Como seu Coach IA, notei que você está indo bem. Lembre-se sempre de verificar os retrovisores antes de mudar de faixa. Para baliza, a dica de ouro é alinhar o retrovisor com o carro da frente antes de começar a girar o volante. Quer mais alguma dica específica?",
            confidence: 0.98
        });
    }, 1000);
});

app.listen(PORT, () => {
    console.log(`AI Service running on port ${PORT}`);
});
