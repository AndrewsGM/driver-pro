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
    res.json({
        analysis: "Good driving behavior detected. Watch speed on turns.",
        score: 85
    });
});

app.listen(PORT, () => {
    console.log(`AI Service running on port ${PORT}`);
});
