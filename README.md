# CZ AI Chatbot Widget

A secure, embeddable AI chatbot widget with iframe isolation, streaming responses, and comprehensive theming support. Built for enterprise-grade chat experiences with mobile optimization and extensive customization options.

## 🚀 Features

- **Secure by Design**: Zero-trust frontend with iframe isolation and backend-enforced authentication
- **Streaming Responses**: Real-time NDJSON streaming for instant message delivery
- **Mobile Optimized**: Full mobile UX with scroll lock, keyboard handling, and safe area support
- **Fully Themed**: CSS variables-based theming with server-side overrides
- **Schema-Driven**: TypeScript-first architecture with shared schemas
- **Enterprise Ready**: JWT authentication, CORS protection, and comprehensive logging
- **Developer Friendly**: Easy integration with minimal configuration

## 🏗️ Architecture

The CZ AI Chatbot consists of four main components:

### Components

- **`chat-widget-loader`**: Lightweight JavaScript loader that injects the iframe
- **`chat-widget-iframe`**: React-based chat UI with message rendering and interactions
- **`chat-backend`**: Node.js/Express server with authentication and streaming APIs
- **`chat-shared-schema`**: TypeScript types and schemas shared across components

### Security Model

- **Iframe Isolation**: Chat UI runs in a separate iframe with no host page access
- **JWT Authentication**: HttpOnly cookies with refresh token rotation
- **CORS Protection**: Dynamic origin validation based on widget allowlists
- **Content Security**: Strict CSP headers and input sanitization

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/cliffzhu/CZ-AIChatbot.git
   cd CZ-AIChatbot
   ```

2. **Install dependencies for all components**
   ```bash
   # Install shared schema first
   cd chat-shared-schema && npm install && npm run build

   # Install backend
   cd ../chat-backend && npm install

   # Install iframe app
   cd ../chat-widget-iframe && npm install

   # Install loader
   cd ../chat-widget-loader && npm install
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Start backend
   cd chat-backend && npm run dev

   # Terminal 2: Start iframe app
   cd chat-widget-iframe && npm run dev

   # Terminal 3: Build loader
   cd chat-widget-loader && npm run build
   ```

4. **Test the integration**
   ```bash
   # Start test server
   python3 -m http.server 8080
   # Open http://localhost:8080/test-integration.html
   ```

## 🔧 Configuration

### Backend Configuration

Create a `.env` file in the `chat-backend` directory:

```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Widget Configuration

Widgets are configured via the backend `/widget/:id/config` endpoint:

```json
{
  "allowedOrigins": ["https://yourdomain.com", "https://app.yourdomain.com"],
  "theme": {
    "primary": "#2563eb",
    "primaryHover": "#1e4fd8",
    "bg": "#ffffff",
    "bgSoft": "#f3f4f6",
 **Puppeteer for E2E testing**
    "muted": "#6b7280",
## Issue #25 Summary

Added a concise summary for Content Security Policy (CSP) recommendations, a versioned GitHub Pages/static CDN structure, and fork customization guidance: see [docs/issue-25-summary.md](docs/issue-25-summary.md).

    "border": "#e5e7eb",
    "radius": "14px",
    "radiusSm": "10px",
    "shadow": "0 10px 30px rgba(0, 0, 0, 0.08)",
    "font": "\"Inter\", system-ui, -apple-system, sans-serif"
  }
}
```

## 🚀 Deployment

### Production Build

1. **Build all components**
   ```bash
   # Build shared schema
   cd chat-shared-schema && npm run build

   # Build iframe app
   cd ../chat-widget-iframe && npm run build

   # Build loader
   cd ../chat-widget-loader && npm run build
   ```

2. **Deploy backend**
   ```bash
   cd chat-backend
   npm run build
   # Deploy dist/ to your server (Heroku, Railway, Vercel, etc.)
   ```

3. **Deploy static assets**
   - Upload `chat-widget-iframe/dist/` to CDN
   - Upload `chat-widget-loader/dist/loader.min.js` to CDN

### Environment Variables

```env
# Backend
PORT=3000
JWT_SECRET=your-production-secret
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# CDN URLs
IFRAME_URL=https://cdn.yourdomain.com/chat-iframe/
LOADER_URL=https://cdn.yourdomain.com/loader.min.js
```

### CDN Distribution

The widget uses versioned CDN distribution for optimal performance:

- **Loader**: `https://cdn.yourdomain.com/v1/loader.min.js`
- **Iframe**: `https://cdn.yourdomain.com/v1/iframe/`
- **Assets**: Cached with long TTL, versioned URLs for cache busting

### Publishing via Tag or Release

- Create a tag matching `vX.Y.Z` and push it to trigger the GitHub Actions workflow which will build artifacts and publish them to the `gh-pages` branch under `out/vX.Y.Z/`.

Example:

```bash
# create and push a tag
git tag v1.2.0
git push origin v1.2.0
```

- Alternatively, create a GitHub Release (published) for the tag — the workflow also triggers on release `published` events.

- After publishing, confirm the files are available at `https://<user>.github.io/<repo>/v1.2.0/iframe/` and `.../v1.2.0/loader/` or from your configured CDN.

Standalone Distribution

- The repo can publish a `standalone` distribution that bundles the `iframe` app and `loader` together under a single path. The workflow will publish this under `/vX.Y.Z/standalone/` and `/latest/standalone/`.

Example standalone files:

- `https://<user>.github.io/<repo>/v1.2.0/standalone/iframe/index.html`
- `https://<user>.github.io/<repo>/v1.2.0/standalone/loader/loader.min.js`

To prepare the standalone build locally:

```bash
# Build components
cd chat-shared-schema && npm ci && npm run build
cd ../chat-widget-iframe && npm ci && npm run build
cd ../chat-widget-loader && npm ci && npm run build

# Assemble standalone
./scripts/build-standalone.sh dist/standalone
```

You can inspect the `dist/standalone` folder and upload it to your static host if needed.

## 📖 Usage

### Basic Integration

Add this script tag to your HTML:

```html
<script
  src="https://cdn.yourdomain.com/v1/loader.min.js"
  data-widget-id="your-widget-id"
  data-position="bottom-right">
</script>
```

### Quick Test Embedding (GitHub Pages)

If you want to quickly test the hosted loader from this repository's GitHub Pages, you can use the `latest` URL. Example:

```html
<script
  src="https://cliffzhu.github.io/CZ-AIChatbot/latest/loader/loader.min.js"
  data-widget-id="your-widget-id"
  data-position="bottom-right">
</script>
```

You can also inject the loader from your browser console on any page for quick testing (useful for prototyping). Example one-liner:

```javascript
var s=document.createElement('script');s.src='https://cliffzhu.github.io/CZ-AIChatbot/latest/loader/loader.min.js';s.setAttribute('data-widget-id','your-widget-id');s.setAttribute('data-position','bottom-right');document.head.appendChild(s);
```

Caveats and notes:

- The loader will attempt to insert the iframe and initialize the widget, but functionality may be limited if the backend enforces `allowedOrigins` or requires authentication tokens.
- Many sites use a strict Content Security Policy (CSP) which can block loading external scripts; console injection will fail on such pages.
- Mixed-content restrictions (HTTP page loading an HTTPS script or vice-versa) can also block the loader.
- Use console injection only for quick local testing — for production embed the loader from a trusted CDN or your own domain and configure allowed origins in your backend.

If you need a reproducible test environment, open [test-integration.html](test-integration.html) or run a local static server and embed the loader there.

### Advanced Configuration

```html
<script
  src="https://cdn.yourdomain.com/v1/loader.min.js"
  data-widget-id="your-widget-id"
  data-position="bottom-right"
  data-theme="dark"
  data-api-url="https://api.yourdomain.com">
</script>
```

### Programmatic Control

```javascript
// Open chat
window.CZChatbot?.open();

// Close chat
window.CZChatbot?.close();

// Send message
window.CZChatbot?.sendMessage('Hello!');

// Apply theme
window.CZChatbot?.setTheme({
  primary: '#ff6b6b',
  bg: '#2d3436'
});
```

## 🔌 API Reference

### Backend Endpoints

#### `GET /widget/:id/config`
Get widget configuration and theme.

**Response:**
```json
{
  "allowedOrigins": ["string"],
  "theme": {
    "primary": "string",
    "primaryHover": "string",
    "bg": "string",
    "bgSoft": "string",
    "text": "string",
    "muted": "string",
    "border": "string",
    "radius": "string",
    "radiusSm": "string",
    "shadow": "string",
    "font": "string"
  }
}
```

#### `POST /runtime/token`
Generate authentication token.

**Request:**
```json
{
  "widgetId": "string",
  "origin": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "expiresAt": 1640995200
}
```

#### `POST /runtime/query`
Send chat message and receive streaming response.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "message": "Hello",
  "conversationId": "optional-uuid"
}
```

**Streaming Response:**
```
{"type": "delta", "content": "Hi"}
{"type": "delta", "content": " there"}
{"type": "done"}
```

### Message Types

#### Text Message
```json
{
  "type": "text",
  "content": "Hello world"
}
```

#### Image Message
```json
{
  "type": "image",
  "url": "https://example.com/image.jpg",
  "alt": "Description",
  "caption": "Optional caption"
}
```

#### Buttons Message
```json
{
  "type": "buttons",
  "id": "interaction-id",
  "options": [
    {"text": "Yes", "value": "yes"},
    {"text": "No", "value": "no"}
  ]
}
```

#### Form Message
```json
{
  "type": "form",
  "id": "form-id",
  "fields": [
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "required": true
    }
  ],
  "submitLabel": "Submit"
}
```

## 🧪 Testing

### Run E2E Tests

```bash
# Install test dependencies
npm install -g puppeteer

# Run test harness
node test-harness.js
```

### Manual Testing

1. Start all services:
   ```bash
   cd chat-backend && npm run dev &
   cd chat-widget-iframe && npm run dev &
   cd chat-widget-loader && npm run build
   ```

2. Open test page:
   ```bash
   python3 -m http.server 8080
   # Visit http://localhost:8080/test-integration.html
   ```

### Test Coverage

- ✅ Widget loading and initialization
- ✅ Theme application and overrides
- ✅ Message sending and streaming
- ✅ Form interactions and validation
- ✅ Network failure handling
- ✅ Mobile responsiveness
- ✅ Performance metrics

## 🔒 Security

### Authentication Flow

1. Widget requests token from `/runtime/token`
2. Backend validates origin against allowlist
3. JWT token issued with 1-hour expiry
4. All subsequent requests include Bearer token

### CORS Protection

- Dynamic origin validation
- Preflight request handling
- Credential support for cookies

### Content Security

- Strict CSP headers
- Input sanitization
- XSS protection
- Secure iframe embedding

## 📊 Monitoring & Observability

### Logging

Structured logging with levels:
- **INFO**: User interactions, theme loads
- **ERROR**: Failed requests, authentication errors
- **PERF**: Request timing, memory usage

### Metrics

- Request latency
- Error rates
- Message throughput
- User engagement

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# Widget loading test
curl https://cdn.yourdomain.com/v1/loader.min.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `node test-harness.js`
5. Commit: `git commit -m 'Add your feature'`
6. Push: `git push origin feature/your-feature`
7. Create a Pull Request

### Development Workflow

```bash
# Setup development environment
npm run setup:all

# Run tests
npm test

# Build for production
npm run build:all

# Deploy to staging
npm run deploy:staging
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.yourdomain.com](https://docs.yourdomain.com)
- **Issues**: [GitHub Issues](https://github.com/cliffzhu/CZ-AIChatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cliffzhu/CZ-AIChatbot/discussions)

## 🙏 Acknowledgments

Built with modern web technologies:
- React for UI components
- TypeScript for type safety
- Express.js for backend APIs
- Vite for fast development
- Puppeteer for E2E testing