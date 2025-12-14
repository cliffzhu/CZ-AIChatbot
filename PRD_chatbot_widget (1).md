# Product Requirements Document (PRD)
## Secure Iframe-Based Chatbot Widget Platform

### 1. Product Overview

#### 1.1 Purpose
Build a **secure, embeddable chatbot frontend** delivered via an **iframe + lightweight loader**, supporting:
- Streaming responses (token/chunk incremental rendering)
- Structured UI (forms, buttons, images)
- Theming & CSS isolation
- JWT-based authentication
- Strict CORS & origin enforcement
- Mobile & desktop responsiveness

The system must allow third-party websites to embed the chatbot with minimal trust assumptions, while **all security decisions remain server-side**.

#### 1.2 Design Principles
1. **Zero Trust Frontend**
   - Frontend never enforces security; backend is sole authority.
2. **Iframe Isolation**
   - Chat UI sandboxed from host page; CSS/JS/DOM isolated.
3. **Streaming-First UX**
   - Time-to-first-token optimized; incremental UI updates.
4. **Schema-Driven UI**
   - No raw HTML injection; backend sends structured messages.
5. **Vendor-Safe Embedding**
   - Easy to embed, easy to audit, predictable risk surface.

---

### 2. Scope

#### In Scope
- Iframe loader/controller (host script)
- Iframe chat application (UI + streaming client)
- Universal message schema (text, images, forms, actions)
- Backend services: auth/token, runtime query, widget config (themes, allowlist)
- Streaming POST transport
- CORS + origin validation
- Observability and security headers

#### Out of Scope (Phase 1)
- CMS-style media library / asset management UI
- Arbitrary HTML rendering / MDX
- Multi-agent routing and advanced workflows (can be Phase 2+)
- Deep CRM integrations (Intercom/Zendesk) (can be Phase 2+)

---

### 3. Users & Use Cases

#### Primary Users
- Website owners embedding a chatbot widget
- End users interacting with chat on embedded sites
- Admins configuring widget theme, allowed domains, and behavior

#### Core Use Cases
- User asks a question; assistant streams answer
- Assistant presents button options; user clicks to continue
- Assistant asks user to fill a form; user submits; backend processes and responds
- Assistant returns an image/thumbnail (photo support)
- Website owner customizes theme by widgetId; changes reflect in iframe UI

---

### 4. High-Level Architecture

```
Host Website
 └── Loader script (small JS, audited)
     └── Iframe (chat app origin)
         ├── UI renderer + state store
         ├── Streaming client (POST)
         ├── Theme engine (CSS vars)
         └── Message schema renderer
              ↓
Backend APIs (authoritative)
 ├── Auth/Token (JWT)
 ├── Runtime Query (streaming)
 ├── Widget Config (themes, allowlisted origins)
 └── Media (optional presigned upload)
```

---

### 5. Frontend Requirements

#### 5.1 Iframe Loader / Controller (Host Script)
**Responsibilities**
- Create and mount iframe
- Control open/close, size, position (desktop) and fullscreen behavior (mobile)
- Apply body scroll locking on mobile open (host-side, minimal + reversible)
- Relay postMessage events to/from iframe
- **No chat network calls**; no access to host inputs

**Constraints**
- Target: ≤300 LOC (excluding minified build tooling)
- No global keystroke listeners (`keydown`, `keypress`)
- No scanning or reading host page inputs
- No persistent storage required

**Configuration**
- Data attributes on `<script>` or global init:
  - `widgetId` (required)
  - `host` / `iframeOrigin` (optional override)
  - `position`, `layout`, `open`, `hideButton`, `hideBar`, `offsets`
  - `themeOverride` (optional, controlled + validated)

**Mobile Behavior**
- When open on small screens:
  - body fixed + scroll locked
  - iframe height uses fill-available hacks as needed
  - viewport meta adjusted only if required and restored on close

#### 5.2 Iframe Chat App
**Responsibilities**
- Render chat UI (messages list, input, controls)
- Streaming display (token/chunk updates)
- Universal message rendering (text/md subset, images, forms, buttons)
- JWT attachment and refresh behavior (or cookie-based)
- Theme application using CSS variables
- Accessibility: keyboard navigation, focus management

**Rendering Safety**
- Markdown subset supported; sanitize/escape HTML by default
- Structured UI blocks are schema-driven (no HTML templates)

---

### 6. Universal Message Schema

#### 6.1 Message Types (Phase 1)
- `text`: plain text or markdown string
- `image`: { url, alt?, width?, height?, caption? }
- `form`: { id, fields[], submitLabel?, validation? }
- `buttons`: { id, options[] }
- `action`: { name, payload? }
- `error`: { code, message }

#### 6.2 Interaction Submissions
User actions (button click / form submit) are sent as **messages**:
- `type: "interaction"`
- `interactionId`
- `values` (form fields) or `selection` (button id)

**No HTML form submission**; JS event-driven only.

---

### 7. Transport: Streaming POST

#### 7.1 Behavior
- Client sends POST with JSON body
- Server responds with a streaming body (chunks)
- Client renders incrementally

#### 7.2 Framing (choose one)
- **NDJSON**: one JSON object per line
- **SSE-like**: `data: {...}\n\n`
- **Raw text** for pure text deltas (not ideal for mixed message types)

**Recommendation:** NDJSON with types:
- `delta` (text chunk)
- `message` (structured message object)
- `done`
- `error`

#### 7.3 Cancellation
- Use `AbortController` client-side
- Backend should detect disconnect and stop generation

---

### 8. Authentication, Authorization, and Trust

#### 8.1 JWT
- Short-lived JWT issued by backend
- Claims include:
  - `widget_id`
  - `origin` (or allowed origins list reference)
  - `scope` (runtime.query, media.upload, etc.)
  - `exp`, `iat`, `jti`

#### 8.2 Transport Options
- Preferred: **HttpOnly Secure cookie** (browser transports token silently; JS never sees it)
- Alternative: **Authorization Bearer** header (token in memory only, refreshed on 401)
- Disallowed: localStorage/sessionStorage token storage

#### 8.3 Trust Boundary Rule
Frontend never validates or enforces auth decisions; backend does all verification.

---

### 9. CORS & Origin Controls

#### 9.1 Backend Responsibilities
- Validate `Origin` header against widget allowlist
- Set `Access-Control-Allow-Origin` dynamically
- Avoid wildcard unless explicitly safe for public widgets
- Validate `Referer` as secondary signal (optional)
- Rate limit by widgetId + origin + IP

#### 9.2 Frontend Responsibilities
- None (beyond sending requests)
- No client-side origin allowlist

---

### 10. CSS Shipping & Theming

#### 10.1 CSS Strategy
- Single bundled CSS for iframe app
- Theme customization via CSS variables only

#### 10.2 Theme Resolution
- Theme is loaded by `widgetId` from backend config
- Applied as CSS variables on root container

Example:
- `--chat-primary`
- `--chat-background`
- `--chat-text`
- `--chat-border`
- `--chat-radius`
- `--chat-width`, `--chat-height`

#### 10.3 Runtime Theme Updates (Optional)
- postMessage `setTheme` from parent or admin console → iframe applies new variables

---

### 11. Photo / Image Support

#### 11.1 Display
- Render image messages safely (no HTML)
- Lazy load with placeholder
- Max dimensions enforced in CSS

#### 11.2 Upload (Phase 2 optional)
- Presigned upload URLs
- Validate file type/size server-side
- Return signed CDN URL for rendering

---

### 12. Mobile & Desktop UX

#### Desktop
- Floating panel anchored to corner
- Configurable size and position
- Optional minimize/maximize

#### Mobile
- Fullscreen panel
- Scroll lock host page while open
- Safe-area handling (iOS)
- Keyboard-aware resizing

---

### 13. Observability & Diagnostics

#### Backend
- Structured logs per request: widgetId, origin, conversationId, status
- Rate-limit events
- Token issuance events
- Streaming duration + token counts

#### Frontend
- Optional debug flags for console logging (off by default)
- Expose lifecycle events: `ready`, `open`, `close`, `error`

---

### 14. Security Requirements

- No raw HTML rendering (sanitize/escape)
- No parent access to iframe DOM
- Loader must not register global keystroke listeners
- Token never stored in persistent storage
- CSP enabled on iframe app origin
- SRI recommended for loader distribution
- Rate limiting and abuse protection enforced server-side

---

### 15. Success Metrics

- Embed time < 5 minutes (developer)
- Time-to-first-token < 300ms median (where feasible)
- 99.9% successful widget initialization rate
- Pass a basic third-party security review checklist
- Mobile fullscreen UX parity

---

### 16. Phased Roadmap

**Phase 1 (MVP)**
- Loader + iframe UI
- Streaming POST runtime
- JWT auth + origin enforcement
- Theme via CSS vars
- Text + buttons + forms + images display

**Phase 2**
- Media uploads
- Advanced analytics hooks
- Admin theme editor + live preview
- Plugin-style client extensions (carefully scoped)

**Phase 3**
- Multi-channel (email, SMS, Slack)
- Enterprise SSO options
- Advanced conversation workflows
