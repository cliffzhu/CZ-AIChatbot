# Chat Widget Loader

Minimal, auditable host script for embedding the chatbot iframe.

## Usage

```html
<script src="https://cdn.example.com/loader.min.js" data-widget-id="123" data-position="bottom-right"></script>
```

## Configuration Attributes

- `data-widget-id`: Required, the widget ID.
- `data-host`: Optional, iframe origin.
- `data-position`: bottom-right, bottom-left, top-right, top-left (default: bottom-right).
- `data-open`: If present, open on load.
- `data-hide-button`: If present, hide the chat button.

## Build

```bash
npm install
npm run build
```

Outputs `dist/loader.min.js` for CDN deployment.