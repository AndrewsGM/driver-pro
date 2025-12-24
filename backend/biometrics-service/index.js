const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'biometrics-service' });
});

app.post('/verify', (req, res) => {
    res.json({ verified: true, confidence: 0.98 });
});

app.listen(PORT, () => {
    console.log(`Biometrics Service running on port ${PORT}`);
});
