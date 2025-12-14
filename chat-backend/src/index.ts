import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import type { WidgetConfig, Theme } from 'chat-shared-schema';

const app = express();
const PORT = 3000;

// Mock data
const defaultTheme: Theme = {
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

const widgetConfigs: Record<string, WidgetConfig> = {
  '123': {
    allowedOrigins: ['http://localhost:5173', 'https://example.com'],
    theme: defaultTheme
  }
};

// Middleware
app.use(cors({
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
app.use(bodyParser.json());

// Mock data
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  try {
    const decoded = jwt.verify(token, 'secret') as any;
    (req as any).widgetId = decoded.widgetId;
    next();
  } catch (err) {
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
  const token = jwt.sign({ widgetId, origin }, 'secret', { expiresIn: '1h' });
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