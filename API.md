# CZ AI Chatbot - API Reference

This document provides comprehensive API documentation for the CZ AI Chatbot backend services.

## 🔐 Authentication

### JWT Token Flow

```javascript
// 1. Request authentication
const response = await fetch('/api/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    widgetId: 'your-widget-id',
    domain: window.location.hostname
  })
});

// 2. Use token for subsequent requests
const token = await response.json();
const headers = {
  'Authorization': `Bearer ${token.accessToken}`,
  'Content-Type': 'application/json'
};
```

### Token Refresh

```javascript
// Automatic refresh on 401 responses
fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token.refreshToken}` }
})
.then(response => response.json())
.then(newToken => {
  // Update stored token
  localStorage.setItem('cz_token', newToken.accessToken);
});
```

## 💬 Chat API

### Start Conversation

```http
POST /api/chat/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "widgetId": "your-widget-id",
  "userId": "optional-user-id",
  "metadata": {
    "pageUrl": "https://yourdomain.com/page",
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://google.com"
  }
}
```

**Response:**
```json
{
  "conversationId": "conv_123456",
  "welcomeMessage": {
    "type": "text",
    "content": "Hello! How can I help you today?"
  }
}
```

### Send Message

```http
POST /api/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "conv_123456",
  "message": {
    "type": "text",
    "content": "Hello, I need help with..."
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

**Streaming Response:**
```javascript
const response = await fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(messageData)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.trim()) {
      const event = JSON.parse(line);
      handleStreamingEvent(event);
    }
  }
}
```

### Message Types

#### Text Message
```json
{
  "type": "text",
  "content": "This is a text message",
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### Image Message
```json
{
  "type": "image",
  "url": "https://example.com/image.jpg",
  "alt": "Description of image",
  "caption": "Optional caption"
}
```

#### Button Message
```json
{
  "type": "buttons",
  "content": "Choose an option:",
  "options": [
    {
      "text": "Option 1",
      "value": "option1",
      "style": "primary"
    },
    {
      "text": "Option 2",
      "value": "option2",
      "style": "secondary"
    }
  ]
}
```

#### Form Message
```json
{
  "type": "form",
  "title": "Contact Information",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "placeholder": "Enter your name"
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "required": true,
      "validation": {
        "pattern": "^[^@]+@[^@]+\\.[^@]+$",
        "message": "Please enter a valid email"
      }
    }
  ],
  "submitText": "Submit"
}
```

#### Error Message
```json
{
  "type": "error",
  "content": "Something went wrong",
  "code": "INTERNAL_ERROR",
  "retryable": true
}
```

### Streaming Events

#### Delta Event
```json
{
  "type": "delta",
  "content": "Hello",
  "conversationId": "conv_123456"
}
```

#### Message Complete
```json
{
  "type": "message",
  "content": {
    "type": "text",
    "content": "Hello! How can I help you today?"
  },
  "conversationId": "conv_123456",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Done Event
```json
{
  "type": "done",
  "conversationId": "conv_123456"
}
```

#### Error Event
```json
{
  "type": "error",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retryAfter": 60,
  "conversationId": "conv_123456"
}
```

## 🎨 Theme API

### Get Theme Configuration

```http
GET /api/widget/theme?widgetId=your-widget-id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "theme": {
    "primary": "#007bff",
    "secondary": "#6c757d",
    "background": "#ffffff",
    "text": "#212529",
    "borderRadius": "8px",
    "fontFamily": "Inter, sans-serif"
  },
  "cssVariables": {
    "--chat-primary": "#007bff",
    "--chat-bg-primary": "#ffffff"
  }
}
```

### Update Theme

```http
POST /api/widget/theme
Authorization: Bearer <token>
Content-Type: application/json

{
  "widgetId": "your-widget-id",
  "theme": {
    "primary": "#ff6b6b",
    "background": "#f8f9fa"
  }
}
```

## 📊 Analytics API

### Track Event

```http
POST /api/analytics/event
Authorization: Bearer <token>
Content-Type: application/json

{
  "event": "widget_open",
  "properties": {
    "widgetId": "your-widget-id",
    "pageUrl": "https://yourdomain.com/page",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Get Analytics

```http
GET /api/analytics/summary?widgetId=your-widget-id&period=7d
Authorization: Bearer <token>
```

**Response:**
```json
{
  "period": "7d",
  "metrics": {
    "totalConversations": 1250,
    "totalMessages": 3400,
    "averageResponseTime": 1.2,
    "userSatisfaction": 4.5,
    "bounceRate": 0.15
  },
  "events": [
    {
      "event": "widget_open",
      "count": 890,
      "uniqueUsers": 650
    }
  ]
}
```

## ⚙️ Configuration API

### Get Widget Configuration

```http
GET /api/widget/config?widgetId=your-widget-id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "widgetId": "your-widget-id",
  "name": "Customer Support Chat",
  "settings": {
    "theme": "default",
    "language": "en",
    "position": "bottom-right",
    "autoOpen": false,
    "mobileFullscreen": true
  },
  "features": {
    "streaming": true,
    "fileUpload": false,
    "voiceInput": true,
    "analytics": true
  },
  "limits": {
    "maxMessagesPerHour": 100,
    "maxConversationsPerDay": 50
  }
}
```

### Update Configuration

```http
PUT /api/widget/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "widgetId": "your-widget-id",
  "settings": {
    "theme": "dark",
    "autoOpen": true,
    "autoOpenDelay": 3000
  }
}
```

## 🔍 Health Check API

### Service Health

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "ai": "healthy"
  },
  "uptime": 86400
}
```

### Detailed Health

```http
GET /api/health/detailed
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "connections": 5
    },
    "redis": {
      "status": "healthy",
      "memory": "256MB",
      "keys": 1250
    },
    "ai_service": {
      "status": "healthy",
      "model": "gpt-4",
      "tokensUsed": 45000
    }
  },
  "metrics": {
    "requestsPerSecond": 25.5,
    "errorRate": 0.001,
    "averageResponseTime": 245
  }
}
```

## 🚦 Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Retry-After: 60

{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retryAfter": 60
}
```

## 🔒 Security

### CORS Configuration

```javascript
// Backend CORS setup
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://staging.yourdomain.com'
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type']
};
```

### Content Security Policy

```javascript
// CSP headers
const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.yourdomain.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"]
};
```

## 📝 Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_TOKEN` | Authentication token is invalid | 401 |
| `EXPIRED_TOKEN` | Authentication token has expired | 401 |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | 403 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INVALID_REQUEST` | Request data is malformed | 400 |
| `WIDGET_NOT_FOUND` | Specified widget does not exist | 404 |
| `CONVERSATION_NOT_FOUND` | Conversation does not exist | 404 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | 503 |

## 🔧 SDK Examples

### JavaScript SDK

```javascript
import { CZChatbot } from 'cz-chatbot-sdk';

const chatbot = new CZChatbot({
  widgetId: 'your-widget-id',
  apiEndpoint: 'https://api.yourdomain.com'
});

// Initialize
await chatbot.init();

// Send message
const response = await chatbot.sendMessage('Hello!');

// Listen for streaming
chatbot.on('message', (message) => {
  console.log('Received:', message);
});

// Handle errors
chatbot.on('error', (error) => {
  console.error('Error:', error);
});
```

### React Hook

```javascript
import { useCZChatbot } from 'cz-chatbot-react';

function ChatComponent() {
  const {
    messages,
    sendMessage,
    isTyping,
    error,
    isConnected
  } = useCZChatbot({
    widgetId: 'your-widget-id'
  });

  const handleSend = async (text) => {
    await sendMessage({ type: 'text', content: text });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {isTyping && <div>Typing...</div>}
      <input
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend(e.target.value);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
```

This API reference provides all endpoints, request/response formats, and integration examples for the CZ AI Chatbot backend services.