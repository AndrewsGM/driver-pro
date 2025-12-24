const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'exam-service' });
});

app.get('/questions', (req, res) => {
    res.json([
        { id: 1, question: "What does a red light mean?", options: ["Stop", "Go", "Slow"], answer: "Stop" }
    ]);
});

app.listen(PORT, () => {
    console.log(`Exam Service running on port ${PORT}`);
});
