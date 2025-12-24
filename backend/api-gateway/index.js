const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 80;

// Enable CORS for all origins
app.use(cors());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'api-gateway' });
});

// Proxy routes to microservices
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '', // Remove /api/auth prefix
    },
    onError: (err, req, res) => {
        console.error('Auth service proxy error:', err.message);
        res.status(503).json({ error: 'Auth service unavailable' });
    }
}));

app.use('/api/classes', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/classes': '',
    },
    onError: (err, req, res) => {
        console.error('Class service proxy error:', err.message);
        res.status(503).json({ error: 'Class service unavailable' });
    }
}));

app.use('/api/ai', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/api/ai': '',
    },
    onError: (err, req, res) => {
        console.error('AI service proxy error:', err.message);
        res.status(503).json({ error: 'AI service unavailable' });
    }
}));

app.use('/api/exams', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
        '^/api/exams': '',
    },
    onError: (err, req, res) => {
        console.error('Exam service proxy error:', err.message);
        res.status(503).json({ error: 'Exam service unavailable' });
    }
}));

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Proxying requests to:');
    console.log('  - Auth Service: http://localhost:3001');
    console.log('  - Class Service: http://localhost:3002');
    console.log('  - AI Service: http://localhost:3003');
    console.log('  - Exam Service: http://localhost:3004');
});
