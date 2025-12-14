# Engineering Tasks – Iframe-Based Chatbot Widget

## 0. Project Setup & Conventions

### 0.1 Repositories
- `chat-widget-loader` (host page JS)
- `chat-widget-iframe` (iframe app)
- `chat-backend` (API, auth, streaming)
- `chat-shared-schema` (message schemas & types)

### 0.2 Suggested Tech Stack
- Iframe UI: React/Preact/Solid
- Streaming: fetch + ReadableStream
- Backend: Cloudflare Workers / Node Edge
- Auth: JWT (short-lived) and/or HttpOnly cookies
- CI/CD: GitHub Actions

---

## 1. Iframe Loader (Host Script)

### Goal
Minimal, auditable loader that mounts and controls iframe without reading host inputs.

### Tasks
- [ ] Create loader entry (TypeScript + build to single minified JS)
- [ ] Implement iframe mount / unmount
- [ ] Implement config parsing (data attributes + programmatic init)
- [ ] Implement desktop positioning:
  - bottom-right, bottom-left, top-right, top-left
  - offsets X/Y
- [ ] Implement open/close/toggle state
- [ ] Implement resize handling & iframe sizing
- [ ] Implement mobile mode:
  - fullscreen height/width
  - body scroll lock toggle
  - safe-area padding handling
- [ ] Implement postMessage bridge:
  - parent → iframe: init, setOpen, setTheme
  - iframe → parent: ready, resize, requestOpen, error
- [ ] Publish loader bundle (CDN) + versioning

### Acceptance Criteria
- Loader does not register global key listeners
- Loader does not query host inputs
- Loader works on modern browsers + mobile Safari

---

## 2. Iframe Chat Application

### Goal
Render chat UI, manage message flow, and communicate with backend securely.

### Tasks
- [ ] App boot + config hydration (from query params + injected config)
- [ ] Build message store (in-memory)
- [ ] Chat UI components:
  - header (optional)
  - message list
  - input composer
  - typing indicator / streaming indicator
- [ ] Streaming renderer for assistant responses
- [ ] Abort/cancel current stream
- [ ] Error states: network fail, auth fail, backend error
- [ ] Implement theme engine:
  - CSS variables apply
  - default theme fallback
- [ ] Accessibility:
  - focus management on open
  - keyboard navigation
  - ARIA labels

---

## 3. Universal Message Schema

### Goal
Schema-driven message protocol; no HTML injection.

### Tasks
- [ ] Define TypeScript types + JSON schema:
  - TextMessage, ImageMessage, FormMessage, ButtonsMessage, ErrorMessage
- [ ] Define InteractionMessage payload for user events
- [ ] Implement schema validation on backend (strict)
- [ ] Implement renderer mapping on frontend (strict)
- [ ] Version schema (`schema_version`) and handle unknown types gracefully

---

## 4. Streaming POST Client

### Goal
Fetch streaming response and render incrementally.

### Tasks
- [ ] Implement `streamingPost(url, payload, token, onEvent)`
- [ ] Support NDJSON framing:
  - parse line-by-line
  - event types: delta, message, done, error
- [ ] Support AbortController cancel
- [ ] Ensure reader lock released correctly
- [ ] Add timeout handling

---

## 5. Frontend Auth (JWT / Cookies)

### Goal
Frontend carries credentials; backend decides trust.

### Tasks
- [ ] Decide transport:
  - Option A: HttpOnly cookie auth
  - Option B: Bearer token in-memory
- [ ] Implement token bootstrap (if header auth)
- [ ] Implement refresh flow (on 401)
- [ ] Ensure no localStorage/sessionStorage token storage
- [ ] Redact token from logs

---

## 6. Backend – Widget Config Service

### Goal
Provide widget config: theme + allowed origins + feature flags.

### Tasks
- [ ] Data model:
  - widgetId
  - allowedOrigins[]
  - theme object
  - flags
- [ ] Endpoint: `GET /widget/:id/config`
- [ ] Caching strategy (edge cache) with safe invalidation
- [ ] Admin update endpoints (Phase 2)

---

## 7. Backend – Auth Service

### Goal
Issue short-lived JWT or set cookies after validating origin & widget.

### Tasks
- [ ] Endpoint: `POST /runtime/token`
- [ ] Validate:
  - widgetId exists
  - origin allowed
  - rate limits
- [ ] Issue JWT with claims (widget_id, origin, scope, exp)
- [ ] Refresh endpoint (if using refresh tokens)
- [ ] Rotate signing keys support (KMS/secret store)

---

## 8. Backend – Runtime Query Service

### Goal
Accept user messages and stream assistant responses.

### Tasks
- [ ] Endpoint: `POST /runtime/query`
- [ ] Validate JWT/cookie and origin
- [ ] Accept message payload:
  - conversationId
  - message (text or interaction)
  - metadata (optional)
- [ ] Maintain conversation state server-side
- [ ] Build prompt context window (server decides history)
- [ ] Stream response as NDJSON events
- [ ] Handle disconnects and abort generation
- [ ] Log token usage and latency

---

## 9. CORS & Security Headers

### Goal
Strict CORS and defense-in-depth.

### Tasks
- [ ] Set `Access-Control-Allow-Origin` dynamically
- [ ] Support `OPTIONS` preflight
- [ ] Enforce `Vary: Origin`
- [ ] CSP for iframe origin:
  - restrict script sources
  - restrict connect-src to APIs
- [ ] `X-Frame-Options` / `frame-ancestors` set appropriately:
  - allow embedding only where intended
- [ ] Rate limiting (per widgetId + origin + IP)
- [ ] Abuse detection hooks

---

## 10. Theming & CSS

### Goal
Single CSS bundle + per-widget theme via CSS variables.

### Tasks
- [ ] Define theme schema
- [ ] Apply theme variables on root container
- [ ] Default theme fallback
- [ ] Theme validation server-side (avoid invalid CSS values)
- [ ] Optional runtime theme update via postMessage

---

## 11. Forms & Buttons

### Goal
Schema-driven interactive UI in chat.

### Tasks
- [ ] Form renderer:
  - text/email/textarea/select/checkbox
  - required + simple validation
- [ ] Submit handler:
  - create InteractionMessage
  - send to `/runtime/query`
- [ ] Buttons renderer:
  - click → InteractionMessage
- [ ] Disable native form submission (`preventDefault`)
- [ ] Clear, error, and loading states

---

## 12. Image / Photo Support

### Goal
Display images as messages safely.

### Tasks
- [ ] Image message renderer with lazy loading
- [ ] Enforce max sizes in CSS
- [ ] Broken image fallback UI
- [ ] (Phase 2) Upload:
  - presigned URL endpoint
  - server-side validations
  - return signed CDN URL

---

## 13. Mobile UX Polish

### Tasks
- [ ] Scroll lock on open (parent + iframe coordination)
- [ ] Handle iOS `-webkit-fill-available`
- [ ] Keyboard open resizing behavior
- [ ] Safe-area insets (env(safe-area-inset-*))
- [ ] Orientation changes

---

## 14. Observability & QA

### Tasks
- [ ] End-to-end test harness page
- [ ] Network failure tests
- [ ] Origin mismatch tests
- [ ] Token expiry / refresh tests
- [ ] Performance: TTFB and TTFT (time-to-first-token)
- [ ] Logging & dashboards (backend)

---

## 15. Release & Deployment

### Tasks
- [ ] CI pipeline for all packages
- [ ] Versioned loader distribution (CDN path includes version)
- [ ] Canary deployment strategy for backend
- [ ] Rollback plan (previous loader version)
- [ ] Docs site / embed guide
