# CZ AI Chatbot - Configuration Reference

This document provides comprehensive configuration options for the CZ AI Chatbot widget.

## 📋 Loader Configuration

### Script Tag Attributes

```html
<script
  src="https://cdn.yourdomain.com/v1/loader.min.js"
  data-widget-id="your-widget-id"
  data-api-endpoint="https://api.yourdomain.com"
  data-position="bottom-right"
  data-theme="default"
  data-language="en"
  data-debug="false"
  data-mobile-fullscreen="true"
  data-max-height="600px"
  data-z-index="9999"
  data-auto-open="false"
  data-open-delay="2000"
  data-hide-on-mobile="false"
  data-custom-css-url=""
  data-analytics-id=""
  data-privacy-policy-url=""
  data-terms-url=""
></script>
```

### Configuration Object (Advanced)

```javascript
window.CZChatbotConfig = {
  widgetId: 'your-widget-id',
  apiEndpoint: 'https://api.yourdomain.com',
  position: 'bottom-right',
  theme: 'default',
  language: 'en',
  debug: false,
  mobileFullscreen: true,
  maxHeight: '600px',
  zIndex: 9999,
  autoOpen: false,
  openDelay: 2000,
  hideOnMobile: false,
  customCssUrl: '',
  analyticsId: '',
  privacyPolicyUrl: '',
  termsUrl: '',
  // Advanced options
  iframeSandbox: 'allow-scripts allow-same-origin allow-forms',
  corsOrigin: window.location.origin,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000
};
```

## 🎨 Theme Configuration

### Built-in Themes

- `default`: Clean, professional theme
- `dark`: Dark mode theme
- `minimal`: Minimalist design
- `corporate`: Business-focused theme

### Custom Theme Variables

```css
:root {
  /* Colors */
  --chat-primary: #007bff;
  --chat-secondary: #6c757d;
  --chat-success: #28a745;
  --chat-danger: #dc3545;
  --chat-warning: #ffc107;
  --chat-info: #17a2b8;

  /* Backgrounds */
  --chat-bg-primary: #ffffff;
  --chat-bg-secondary: #f8f9fa;
  --chat-bg-accent: #e9ecef;

  /* Text */
  --chat-text-primary: #212529;
  --chat-text-secondary: #6c757d;
  --chat-text-muted: #adb5bd;

  /* Borders */
  --chat-border-color: #dee2e6;
  --chat-border-radius: 8px;
  --chat-border-width: 1px;

  /* Shadows */
  --chat-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --chat-shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --chat-shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Spacing */
  --chat-spacing-xs: 4px;
  --chat-spacing-sm: 8px;
  --chat-spacing-md: 16px;
  --chat-spacing-lg: 24px;
  --chat-spacing-xl: 32px;

  /* Typography */
  --chat-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --chat-font-size-xs: 12px;
  --chat-font-size-sm: 14px;
  --chat-font-size-md: 16px;
  --chat-font-size-lg: 18px;
  --chat-font-size-xl: 20px;

  /* Layout */
  --chat-max-width: 400px;
  --chat-min-height: 400px;
  --chat-max-height: 600px;
  --chat-border-radius: 12px;
  --chat-z-index: 9999;

  /* Animations */
  --chat-transition-fast: 0.15s ease;
  --chat-transition-normal: 0.3s ease;
  --chat-transition-slow: 0.5s ease;

  /* Mobile */
  --chat-mobile-padding: 16px;
  --chat-mobile-border-radius: 0;
  --chat-mobile-max-height: 100vh;
}
```

### Server-side Theme Override

```javascript
// POST /api/widget/config
{
  "widgetId": "your-widget-id",
  "theme": {
    "primary": "#ff6b6b",
    "background": "#f8f9fa",
    "text": "#2d3436",
    "borderRadius": "16px"
  }
}
```

## 🌐 Language Configuration

### Supported Languages

- `en`: English (default)
- `es`: Spanish
- `fr`: French
- `de`: German
- `it`: Italian
- `pt`: Portuguese
- `ru`: Russian
- `zh`: Chinese
- `ja`: Japanese
- `ko`: Korean

### Custom Language Pack

```javascript
window.CZChatbotLang = {
  en: {
    welcome: "Hello! How can I help you today?",
    typing: "Typing...",
    send: "Send",
    close: "Close",
    minimize: "Minimize",
    error: "Something went wrong. Please try again.",
    retry: "Retry",
    poweredBy: "Powered by CZ AI"
  },
  es: {
    welcome: "¡Hola! ¿Cómo puedo ayudarte hoy?",
    typing: "Escribiendo...",
    send: "Enviar",
    close: "Cerrar",
    minimize: "Minimizar",
    error: "Algo salió mal. Por favor, inténtalo de nuevo.",
    retry: "Reintentar",
    poweredBy: "Desarrollado por CZ AI"
  }
};
```

## 📱 Mobile Configuration

### Mobile-Specific Options

```javascript
{
  mobileFullscreen: true,        // Full screen on mobile
  mobileSafeArea: true,         // Respect safe area insets
  mobileScrollLock: true,       // Prevent background scrolling
  mobileKeyboardHandling: true, // Adjust for keyboard
  mobileOrientationLock: false, // Lock orientation
  mobileVibration: false        // Haptic feedback
}
```

### iOS-Specific Features

```javascript
// iOS Safari detection and handling
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isIOS && isSafari) {
  // Enable iOS-specific features
  config.iosWebkitScroll = true;
  config.iosInputFocus = true;
  config.iosOrientationChange = true;
}
```

## 🔧 Advanced Configuration

### API Configuration

```javascript
{
  apiEndpoint: 'https://api.yourdomain.com',
  apiVersion: 'v1',
  apiTimeout: 30000,
  apiRetries: 3,
  apiRetryDelay: 1000,
  apiHeaders: {
    'X-API-Key': 'your-api-key'
  }
}
```

### Security Configuration

```javascript
{
  corsEnabled: true,
  corsOrigins: ['https://yourdomain.com'],
  contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'",
  iframeSandbox: 'allow-scripts allow-same-origin allow-forms allow-popups',
  xFrameOptions: 'DENY',
  hstsEnabled: true,
  hstsMaxAge: 31536000
}
```

### Performance Configuration

```javascript
{
  lazyLoad: true,
  preloadAssets: true,
  cacheStrategy: 'network-first',
  compressionEnabled: true,
  minifyAssets: true,
  bundleSplitting: true,
  serviceWorkerEnabled: false
}
```

### Analytics Configuration

```javascript
{
  analyticsEnabled: true,
  analyticsProvider: 'google-analytics',
  analyticsId: 'GA-XXXXXXXXX',
  trackEvents: ['open', 'close', 'message', 'error'],
  trackUserId: false,
  trackSessionId: true,
  privacyCompliant: true
}
```

## 🎯 Behavior Configuration

### Interaction Settings

```javascript
{
  autoOpen: false,
  autoOpenDelay: 2000,
  autoOpenTrigger: 'scroll', // 'scroll', 'time', 'exit-intent'
  autoOpenScrollPercent: 50,
  minimizeOnOutsideClick: true,
  closeOnEscape: true,
  persistState: true,
  persistMessages: true,
  maxMessages: 100
}
```

### UI Customization

```javascript
{
  showPoweredBy: true,
  showTimestamp: true,
  showTypingIndicator: true,
  showAvatar: true,
  avatarUrl: 'https://yourdomain.com/avatar.png',
  botName: 'CZ Assistant',
  userName: 'You',
  placeholderText: 'Type your message...',
  sendButtonText: 'Send',
  closeButtonText: '×'
}
```

## 🔌 Plugin Configuration

### Available Plugins

```javascript
{
  plugins: [
    {
      name: 'emoji-picker',
      enabled: true,
      config: {
        position: 'top',
        theme: 'light'
      }
    },
    {
      name: 'file-upload',
      enabled: false,
      config: {
        maxSize: '10MB',
        allowedTypes: ['image/*', 'application/pdf']
      }
    },
    {
      name: 'voice-input',
      enabled: true,
      config: {
        language: 'en-US',
        continuous: false
      }
    }
  ]
}
```

## 📊 Monitoring Configuration

### Error Tracking

```javascript
{
  errorTrackingEnabled: true,
  errorTrackingProvider: 'sentry',
  errorTrackingDsn: 'https://xxx@sentry.io/xxx',
  errorTrackingEnvironment: 'production',
  errorTrackingRelease: 'v1.0.0'
}
```

### Performance Monitoring

```javascript
{
  performanceMonitoringEnabled: true,
  performanceTracking: ['load-time', 'response-time', 'error-rate'],
  performanceThresholds: {
    loadTime: 2000,    // ms
    responseTime: 1000, // ms
    errorRate: 0.05    // 5%
  }
}
```

## 🚀 Initialization Examples

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script
    src="https://cdn.yourdomain.com/v1/loader.min.js"
    data-widget-id="demo-widget"
    data-api-endpoint="https://api.yourdomain.com"
  ></script>
</head>
<body>
  <h1>Welcome to our site!</h1>
</body>
</html>
```

### Advanced Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    window.CZChatbotConfig = {
      widgetId: 'advanced-widget',
      apiEndpoint: 'https://api.yourdomain.com',
      position: 'bottom-left',
      theme: 'dark',
      language: 'en',
      debug: false,
      mobileFullscreen: true,
      autoOpen: true,
      autoOpenDelay: 3000,
      analyticsId: 'GA-XXXXXXXXX',
      customCssUrl: 'https://yourdomain.com/custom.css'
    };
  </script>
  <script src="https://cdn.yourdomain.com/v1/loader.min.js"></script>
</head>
<body>
  <h1>Advanced Chatbot Integration</h1>
</body>
</html>
```

This configuration reference provides all available options for customizing the CZ AI Chatbot widget to match your specific requirements and branding.