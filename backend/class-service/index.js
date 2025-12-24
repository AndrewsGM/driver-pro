const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'class-service' });
});

app.get('/classes', (req, res) => {
    res.json([
        { id: 1, type: 'urban', date: new Date(), status: 'completed' },
        { id: 2, type: 'parking', date: new Date(), status: 'scheduled' }
    ]);
});

app.listen(PORT, () => {
    console.log(`Class Service running on port ${PORT}`);
});
