const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'exam-service' });
});

const questions = [
    { id: 1, category: 'Legislação de Trânsito', question: 'Qual a velocidade máxima permitida em vias locais?', options: ['30 km/h', '40 km/h', '50 km/h', '60 km/h'], correct: 0 },
    { id: 2, category: 'Legislação de Trânsito', question: 'A CNH provisória tem validade de:', options: ['6 meses', '1 ano', '2 anos', '5 anos'], correct: 1 }
];

app.get('/questions', (req, res) => {
    res.json(questions);
});

app.listen(PORT, () => {
    console.log(`Exam Service running on port ${PORT}`);
});
