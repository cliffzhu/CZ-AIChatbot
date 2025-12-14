# CZ AI Chatbot - Troubleshooting Guide

This guide helps diagnose and resolve common issues with the CZ AI Chatbot widget.

## 🔍 Quick Diagnosis

### Widget Not Loading

**Symptoms:**
- Chat widget doesn't appear on page
- Console shows loading errors
- Network requests fail

**Quick Checks:**
```javascript
// Check if script is loaded
console.log('CZ Chatbot loaded:', typeof window.CZChatbot !== 'undefined');

// Check configuration
console.log('Config:', window.CZChatbotConfig);

// Check network
fetch('https://cdn.yourdomain.com/v1/loader.min.js')
  .then(r => console.log('CDN accessible:', r.ok))
  .catch(e => console.log('CDN error:', e));
```

**Common Solutions:**

1. **Script Loading Issues**
   ```html
   <!-- Check script tag placement -->
   <script src="https://cdn.yourdomain.com/v1/loader.min.js" defer></script>

   <!-- Or load synchronously -->
   <script src="https://cdn.yourdomain.com/v1/loader.min.js"></script>
   ```

2. **CORS Issues**
   ```javascript
   // Backend CORS configuration
   app.use(cors({
     origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
     credentials: true
   }));
   ```

3. **Content Security Policy**
   ```html
   <!-- Add to HTML head -->
   <meta http-equiv="Content-Security-Policy" content="
     default-src 'self';
     script-src 'self' 'unsafe-inline' https://cdn.yourdomain.com;
     style-src 'self' 'unsafe-inline';
     connect-src 'self' https://api.yourdomain.com;
   ">
   ```

### Authentication Failures

**Symptoms:**
- Widget loads but shows authentication error
- API requests return 401/403
- Token refresh fails

**Debug Steps:**
```javascript
// Check token storage
console.log('Stored token:', localStorage.getItem('cz_token'));

// Test API endpoint
fetch('/api/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    widgetId: 'your-widget-id',
    domain: window.location.hostname
  })
})
.then(r => r.json())
.then(data => console.log('Auth response:', data))
.catch(e => console.log('Auth error:', e));
```

**Solutions:**

1. **Invalid Widget ID**
   ```javascript
   // Verify widget ID in backend
   const validWidget = await db.widgets.findOne({
     id: widgetId,
     domains: { $in: [requestDomain] }
   });
   ```

2. **Domain Not Whitelisted**
   ```javascript
   // Add domain to widget configuration
   await db.widgets.updateOne(
     { id: widgetId },
     { $push: { allowedDomains: 'newdomain.com' } }
   );
   ```

3. **Token Expiration**
   ```javascript
   // Implement automatic refresh
   const token = getStoredToken();
   if (isTokenExpired(token)) {
     const newToken = await refreshToken(token.refreshToken);
     storeToken(newToken);
   }
   ```

### Streaming Issues

**Symptoms:**
- Messages don't stream in real-time
- Chat appears frozen
- Network timeouts

**Debug Commands:**
```javascript
// Test streaming endpoint
const eventSource = new EventSource('/api/chat/stream?token=' + token);
eventSource.onmessage = (e) => console.log('Stream event:', e.data);
eventSource.onerror = (e) => console.log('Stream error:', e);

// Check network support
console.log('Fetch API:', typeof fetch !== 'undefined');
console.log('ReadableStream:', typeof ReadableStream !== 'undefined');
```

**Solutions:**

1. **Server-Sent Events Fallback**
   ```javascript
   // Fallback for browsers without fetch streams
   if (!window.ReadableStream) {
     useServerSentEvents();
   }
   ```

2. **Connection Timeout**
   ```javascript
   // Increase timeout and add retry logic
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000);

   fetch(url, {
     signal: controller.signal,
     // ... other options
   })
   .finally(() => clearTimeout(timeoutId));
   ```

3. **Network Interruption**
   ```javascript
   // Implement reconnection logic
   let reconnectAttempts = 0;
   const maxReconnectAttempts = 5;

   function connect() {
     const eventSource = new EventSource(url);
     eventSource.onerror = () => {
       if (reconnectAttempts < maxReconnectAttempts) {
         setTimeout(() => {
           reconnectAttempts++;
           connect();
         }, 1000 * reconnectAttempts);
       }
     };
   }
   ```

## 🎨 Theming Problems

**Symptoms:**
- Styles don't apply correctly
- Theme variables not working
- Inconsistent appearance

**Debug Steps:**
```javascript
// Check CSS variables
const root = document.documentElement;
const styles = getComputedStyle(root);
console.log('Primary color:', styles.getPropertyValue('--chat-primary'));

// Inspect iframe
const iframe = document.querySelector('iframe[src*="chat-iframe"]');
console.log('Iframe loaded:', iframe?.contentWindow !== null);
```

**Solutions:**

1. **CSS Variable Conflicts**
   ```css
   /* Use specific prefixes */
   :root {
     --cz-chat-primary: #007bff;
     --cz-chat-background: #ffffff;
   }

   /* Apply to iframe */
   iframe {
     --chat-primary: var(--cz-chat-primary);
   }
   ```

2. **Iframe Style Isolation**
   ```javascript
   // Inject styles into iframe
   const iframe = document.querySelector('iframe');
   const iframeDoc = iframe.contentDocument;
   const style = iframeDoc.createElement('style');
   style.textContent = `
     :root {
       --chat-primary: ${theme.primary};
     }
   `;
   iframeDoc.head.appendChild(style);
   ```

3. **Theme Loading Issues**
   ```javascript
   // Preload theme CSS
   const link = document.createElement('link');
   link.rel = 'stylesheet';
   link.href = theme.cssUrl;
   document.head.appendChild(link);
   ```

## 📱 Mobile Issues

**Symptoms:**
- Widget doesn't work on mobile
- Touch interactions fail
- Layout breaks on small screens

**Debug Steps:**
```javascript
// Check mobile detection
console.log('Is mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

// Check viewport
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);

// Test touch events
document.addEventListener('touchstart', () => console.log('Touch detected'));
```

**Solutions:**

1. **Viewport Meta Tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
   ```

2. **Touch Event Handling**
   ```javascript
   // Use touch-friendly event listeners
   element.addEventListener('touchstart', handleTouchStart, { passive: true });
   element.addEventListener('touchend', handleTouchEnd, { passive: true });

   // Prevent zoom on double-tap
   element.addEventListener('touchend', (e) => {
     e.preventDefault();
   }, { passive: false });
   ```

3. **iOS Safari Issues**
   ```javascript
   // Fix iOS Safari scrolling
   if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
     document.body.style.webkitOverflowScrolling = 'touch';
     document.body.style.overflowScrolling = 'touch';
   }
   ```

## 🔧 Performance Issues

**Symptoms:**
- Widget loads slowly
- High memory usage
- Poor scrolling performance

**Debug Steps:**
```javascript
// Measure load time
const start = performance.now();
window.addEventListener('load', () => {
  console.log('Load time:', performance.now() - start, 'ms');
});

// Check memory usage
if (performance.memory) {
  console.log('Memory:', performance.memory);
}

// Profile rendering
console.profile('Chat render');
renderChat();
console.profileEnd();
```

**Solutions:**

1. **Lazy Loading**
   ```javascript
   // Load widget only when needed
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         loadChatWidget();
         observer.disconnect();
       }
     });
   });
   observer.observe(document.body);
   ```

2. **Asset Optimization**
   ```javascript
   // Compress and minify assets
   const compression = require('compression');
   app.use(compression());

   // Cache static assets
   app.use(express.static('public', {
     maxAge: '1y',
     etag: false
   }));
   ```

3. **Memory Leaks**
   ```javascript
   // Clean up event listeners
   function cleanup() {
     eventSource.close();
     clearInterval(pingInterval);
     // Remove DOM elements
   }

   // Call cleanup on page unload
   window.addEventListener('beforeunload', cleanup);
   ```

## 🌐 Network Issues

**Symptoms:**
- Intermittent connection failures
- Slow response times
- CDN loading problems

**Debug Steps:**
```javascript
// Test connectivity
fetch('https://httpbin.org/status/200')
  .then(() => console.log('Network OK'))
  .catch(e => console.log('Network error:', e));

// Check DNS
console.time('DNS lookup');
fetch('https://cdn.yourdomain.com/v1/loader.min.js', { method: 'HEAD' })
  .then(() => console.timeEnd('DNS lookup'))
  .catch(e => console.log('DNS error:', e));

// Monitor requests
if (window.PerformanceObserver) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('Request:', entry.name, entry.duration, 'ms');
    });
  });
  observer.observe({ entryTypes: ['resource'] });
}
```

**Solutions:**

1. **CDN Configuration**
   ```nginx
   # CDN configuration
   location /v1/ {
     add_header Cache-Control "public, max-age=31536000, immutable";
     add_header Access-Control-Allow-Origin "*";
     gzip on;
     gzip_types text/css application/javascript;
   }
   ```

2. **Retry Logic**
   ```javascript
   async function fetchWithRetry(url, options = {}, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const response = await fetch(url, options);
         if (response.ok) return response;
         throw new Error(`HTTP ${response.status}`);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   }
   ```

3. **Offline Support**
   ```javascript
   // Service worker for offline support
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js')
       .then(registration => console.log('SW registered'))
       .catch(error => console.log('SW registration failed'));
   }
   ```

## 🐛 Common Error Messages

### "Widget ID not found"
```
Error: Widget ID not found
Code: WIDGET_NOT_FOUND
```

**Solutions:**
- Verify widget ID is correct
- Check if widget is active in backend
- Ensure domain is whitelisted

### "CORS policy violation"
```
Access to XMLHttpRequest at 'https://api.yourdomain.com' from origin 'https://yourdomain.com' has been blocked by CORS policy
```

**Solutions:**
- Add domain to CORS allowed origins
- Check if preflight requests are handled
- Verify HTTPS is used consistently

### "Failed to fetch"
```
TypeError: Failed to fetch
```

**Solutions:**
- Check network connectivity
- Verify API endpoint URL
- Check for firewall/proxy issues
- Ensure HTTPS certificates are valid

### "Streaming connection lost"
```
Error: Streaming connection lost
Code: CONNECTION_LOST
```

**Solutions:**
- Implement automatic reconnection
- Check server capacity
- Verify WebSocket/SSE configuration
- Monitor network stability

## 📊 Monitoring & Logs

### Client-side Logging

```javascript
// Enable debug logging
window.CZChatbotConfig = {
  debug: true,
  logLevel: 'verbose' // 'error', 'warn', 'info', 'debug', 'verbose'
};

// Custom logger
const logger = {
  error: (msg, ...args) => console.error('[CZ]', msg, ...args),
  warn: (msg, ...args) => console.warn('[CZ]', msg, ...args),
  info: (msg, ...args) => console.info('[CZ]', msg, ...args),
  debug: (msg, ...args) => console.debug('[CZ]', msg, ...args)
};
```

### Server-side Monitoring

```javascript
// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Error tracking
app.use((error, req, res, next) => {
  console.error('Error:', error);
  // Send to error tracking service
  trackError(error, req);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Performance Monitoring

```javascript
// Performance marks
performance.mark('chat-init-start');
initializeChat();
performance.mark('chat-init-end');
performance.measure('chat-init', 'chat-init-start', 'chat-init-end');

console.log('Init time:', performance.getEntriesByName('chat-init')[0].duration);
```

## 🚨 Emergency Procedures

### Complete Widget Failure

1. **Immediate Response**
   ```javascript
   // Disable widget temporarily
   window.CZChatbotConfig = { disabled: true };
   ```

2. **Rollback Deployment**
   ```bash
   # Rollback to previous version
   git checkout v1.0.0
   npm run build
   npm run deploy
   ```

3. **Alternative Chat System**
   ```html
   <!-- Fallback chat widget -->
   <div id="fallback-chat">
     <a href="mailto:support@yourdomain.com">Contact Support</a>
   </div>
   ```

### Data Loss Recovery

1. **Check Backups**
   ```bash
   # Restore from backup
   mongorestore --db cz_chatbot backup/
   ```

2. **Audit Logs**
   ```javascript
   // Query recent conversations
   db.conversations.find({
     createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
   });
   ```

This troubleshooting guide provides systematic approaches to diagnose and resolve issues with the CZ AI Chatbot widget implementation.