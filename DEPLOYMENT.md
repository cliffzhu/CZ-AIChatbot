# CZ AI Chatbot - Deployment Guide

This guide covers production deployment of the CZ AI Chatbot widget across different platforms.

## 🚀 Quick Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy backend
   cd chat-backend
   vercel --prod

   # Deploy iframe (static)
   cd ../chat-widget-iframe
   vercel --prod
   ```

2. **Environment Variables**
   ```bash
   vercel env add JWT_SECRET
   vercel env add NODE_ENV production
   ```

### Option 2: Railway

1. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   cd chat-backend
   railway deploy
   ```

2. **Static Assets**
   - Upload iframe dist to Cloudflare R2
   - Upload loader to CDN

### Option 3: Docker

```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and deploy
docker build -t cz-chatbot .
docker run -p 3000:3000 cz-chatbot
```

## 🏗️ CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Build shared schema
      - name: Build Schema
        run: cd chat-shared-schema && npm install && npm run build

      # Build iframe
      - name: Build Iframe
        run: cd chat-widget-iframe && npm install && npm run build

      # Build loader
        run: cd chat-widget-loader && npm install && npm run build

      # Deploy to CDN
      - name: Deploy to CDN
        uses: cloudflare/wrangler-action@2.0.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy dist --project-name=cz-chatbot
```

## 📦 CDN Distribution

### Versioned Releases

```bash
# Tag release
git tag v1.0.0
git push origin v1.0.0

# CDN URLs
https://cdn.yourdomain.com/v1/loader.min.js
https://cdn.yourdomain.com/v1/iframe/
```

### Cache Strategy

```nginx
# Nginx configuration
location /v1/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header X-Version v1.0.0;
}

location /latest/ {
    add_header Cache-Control "public, max-age=3600";
    rewrite ^/latest/(.*)$ /v1/$1 last;
}
```

## 🔄 Rollback Strategy

### Quick Rollback

```bash
# Rollback to previous version
git checkout v0.9.0
npm run build:all
npm run deploy

# Update CDN routing
# Point /latest/ to previous version
```

### Blue-Green Deployment

1. Deploy new version to staging
2. Run E2E tests against staging
3. Switch production traffic
4. Monitor for 30 minutes
5. Rollback if issues detected

## 📊 Monitoring Setup

### Application Monitoring

```javascript
// Backend monitoring
const express = require('express');
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    requests: requestCount
  });
});
```

### CDN Monitoring

- **Cloudflare Analytics**: Request volume, error rates, performance
- **Uptime Monitoring**: Ping health endpoints every 30 seconds
- **Error Tracking**: Sentry or similar for client-side errors

### Alerting Rules

- Response time > 2s for 5 minutes
- Error rate > 5% for 10 minutes
- Widget load failures > 1%
- Backend unavailable for > 5 minutes

## 🔒 Security Checklist

### Pre-deployment

- [ ] JWT secrets rotated
- [ ] CORS origins configured
- [ ] HTTPS enforced
- [ ] CSP headers set
- [ ] Dependencies updated
- [ ] Security scan passed

### Production Checks

- [ ] SSL certificate valid
- [ ] Domain ownership verified
- [ ] Rate limiting configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts active

## 🌍 Multi-region Deployment

### CDN Configuration

```javascript
// Cloudflare Worker for geo-routing
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const country = request.cf.country;

  // Route based on geography
  if (['CN', 'HK', 'TW'].includes(country)) {
    return fetch('https://asia.cdn.yourdomain.com' + request.url.pathname);
  }

  return fetch('https://us.cdn.yourdomain.com' + request.url.pathname);
}
```

### Database Replication

- Primary region: US East
- Replica regions: EU West, Asia Pacific
- Cross-region failover: < 30 seconds

## 📈 Performance Optimization

### Frontend

```javascript
// Code splitting
const ChatWidget = lazy(() => import('./ChatWidget'));

// Image optimization
const imageLoader = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target as HTMLImageElement;
      img.src = img.dataset.src!;
      imageLoader.unobserve(img);
    }
  });
});
```

### Backend

```javascript
// Connection pooling
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Response compression
app.use(compression());

// Caching
const cache = new NodeCache({ stdTTL: 600 });
app.use((req, res, next) => {
  const key = req.originalUrl;
  const cached = cache.get(key);
  if (cached) return res.json(cached);
  next();
});
```

## 🚨 Incident Response

### Rollback Procedure

1. **Detect Issue**
   - Monitor alerts trigger
   - User reports increase

2. **Assess Impact**
   - Check error rates
   - Review recent deployments

3. **Execute Rollback**
   ```bash
   # Switch to previous version
   kubectl set image deployment/chatbot app=cz-chatbot:v0.9.0

   # Update CDN
   cfcli purge /v1/*
   ```

4. **Post-mortem**
   - Document root cause
   - Update runbooks
   - Improve monitoring

### Communication Template

```
🚨 Incident: CZ Chatbot Degraded Performance

Status: Investigating
Impact: 15% of users affected
Timeline:
- 14:30: Alert triggered
- 14:35: Investigation started
- 14:45: Root cause identified
- 15:00: Rollback completed

Next update: 15:30
```

This deployment guide ensures reliable, scalable, and secure operation of the CZ AI Chatbot widget in production environments.