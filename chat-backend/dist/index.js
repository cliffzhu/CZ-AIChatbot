"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const PORT = 3000;
// Mock data
const defaultTheme = {
    primary: '#2563eb',
    primaryHover: '#1e4fd8',
    bg: '#ffffff',
    bgSoft: '#f3f4f6',
    text: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb',
    radius: '14px',
    radiusSm: '10px',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    font: '"Inter", system-ui, -apple-system, sans-serif'
};
const widgetConfigs = {
    '123': {
        allowedOrigins: ['http://localhost:5173', 'https://example.com'],
        theme: defaultTheme
    }
};
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // In prod, check against allowed origins
        callback(null, true);
    },
    credentials: true
}));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY'); // Since iframe is same origin or allowed
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
app.use(body_parser_1.default.json());
// Mock data
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'No token' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'secret');
        req.widgetId = decoded.widgetId;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
// Routes
app.get('/widget/:id/config', (req, res) => {
    const { id } = req.params;
    const config = widgetConfigs[id];
    if (!config) {
        return res.status(404).json({ error: 'Widget not found' });
    }
    res.json(config);
});
app.post('/runtime/token', (req, res) => {
    const { widgetId, origin } = req.body;
    const config = widgetConfigs[widgetId];
    if (!config) {
        return res.status(400).json({ error: 'Invalid widget' });
    }
    if (!config.allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }
    const token = jsonwebtoken_1.default.sign({ widgetId, origin }, 'secret', { expiresIn: '1h' });
    res.json({ token });
});
app.post('/runtime/query', authenticate, async (req, res) => {
    // Mock streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const events = [
        { type: 'delta', content: 'Hello' },
        { type: 'delta', content: ' from' },
        { type: 'delta', content: ' the' },
        { type: 'delta', content: ' assistant!' },
        { type: 'done' }
    ];
    for (const event of events) {
        res.write(JSON.stringify(event) + '\n');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    res.end();
});
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
