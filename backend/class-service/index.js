const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'class-service' });
});

// Mock Session Data matching Frontend expectations
const sessions = [
    {
        id: "sess_1",
        created_date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        score: 90,
        duration_minutes: 45,
        type: 'urban'
    },
    {
        id: "sess_2",
        created_date: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed',
        score: 85,
        duration_minutes: 30,
        type: 'parking'
    },
    {
        id: "sess_3",
        created_date: new Date(Date.now() - 259200000).toISOString(),
        status: 'completed',
        score: 95,
        duration_minutes: 60,
        type: 'highway'
    }
];

app.get('/classes', (req, res) => {
    console.log("[Class Service] Fetching classes");
    res.json(sessions);
});

app.listen(PORT, () => {
    console.log(`Class Service running on port ${PORT}`);
});
