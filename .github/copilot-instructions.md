# CZ-AIChatbot AI Coding Instructions

## Project Overview
This project builds a secure, embeddable chatbot widget using an iframe + lightweight loader. Key architecture:
- **Host Script (Loader)**: Minimal JS that mounts iframe, handles positioning, and relays postMessage events. No host page access.
- **Iframe App**: React-based chat UI with streaming renderer, schema-driven messages, and theme engine.
- **Backend**: Edge runtime (Cloudflare Workers/Node) providing auth, config, and streaming query APIs.
- **Shared Schema**: TypeScript types for message protocol (text, image, form, buttons, error).

Security-first: Zero trust frontend, backend-enforced auth, strict CORS, no HTML injection.

## Key Files
- [PRD_chatbot_widget (1).md](PRD_chatbot_widget (1).md): Product requirements, architecture, security principles.
- [ENGINEERING_TASKS (2).md](ENGINEERING_TASKS (2).md): Implementation tasks, broken down by component.

## Development Workflow
- **Setup**: Create separate repos for loader, iframe, backend, schema. Use TypeScript, build to minified JS for loader.
- **Build**: Loader: Single bundled JS. Iframe: React app with CSS variables. Backend: Edge functions.
- **Testing**: E2E harness for embedding, network failures, origin validation. Use AbortController for streaming cancels.
- **Deployment**: Versioned CDN for loader, canary for backend. CI via GitHub Actions.

## Conventions & Patterns
- **Auth**: Prefer HttpOnly cookies over Bearer tokens; refresh on 401. No localStorage for tokens.
- **Streaming**: NDJSON framing (delta, message, done, error). Use fetch + ReadableStream, handle aborts.
- **Messages**: Schema-driven rendering only. Interactions (button/form) send as `type: "interaction"` messages.
- **Theming**: CSS variables on root (e.g., `--chat-primary`). Server-validated themes.
- **Iframe Comm**: postMessage for init, open/close, theme updates. Parent relays without reading host.
- **Security**: Sanitize/escape all text; CSP on iframe; dynamic CORS based on widget allowlist.
- **Mobile**: Fullscreen on small screens, scroll lock host page, safe-area insets.

## Examples
- Loader config: `<script data-widget-id="123" data-position="bottom-right">`
- Message schema: `{ type: "text", content: "Hello" }` or `{ type: "buttons", options: [{ text: "Yes", value: "yes" }] }`
- Streaming event: `{"type": "delta", "content": "Hi"}` followed by `{"type": "done"}`

Focus on Phase 1 MVP: streaming text/buttons/forms/images, JWT auth, theming. Defer uploads and advanced workflows.


once each task is completed, try to test and varify the result by automated script or terminal commands, if you need a human varification, give instruction, and add comments to issues and close the issue once the issue resolution is resolved.