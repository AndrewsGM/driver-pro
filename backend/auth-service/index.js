const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock Database
const users = [
    { id: "user_123", email: "demo@driverpro.com", password: "password", name: "João Silva" }
];

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'auth-service' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ token: "mock_token_123", user: { id: user.id, email: user.email, name: user.name } });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

app.get('/me', (req, res) => {
    // In a real app, verify token. Here, just return mock user.
    res.json(users[0]);
});

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
