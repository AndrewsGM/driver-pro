const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock Database
const users = [
    { id: "user_123", email: "demo@driverpro.com", password: "password", name: "João Silva", full_name: "João Silva" }
];

const userProgress = {
    level: 12,
    total_xp: 8450,
    streak_days: 5,
    total_sessions: 22,
    total_hours: 18.5,
    avg_score: 87,
    skills: {
        parking: 88,
        highway: 78,
        night_driving: 92,
        urban: 85,
        maneuvers: 75
    },
    badges: ['iniciante', 'primeira_aula'],
    subscription_plan: 'quarterly',
    created_by: "demo@driverpro.com"
};

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'auth-service' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ token: "mock_token_123", user });
    } else {
        // For demo purposes, if no match, still return success for "demo@driverpro.com" if password matches roughly or just default
        // Or strictly enforce it since we want "senior" behavior.
        if (email === 'demo@driverpro.com') {
            res.json({ token: "mock_token_123", user: users[0] });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    }
});

app.get('/me', (req, res) => {
    // Mock validation
    res.json(users[0]);
});

app.get('/progress', (req, res) => {
    // Return mock progress for the logged user
    res.json(userProgress);
});

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
