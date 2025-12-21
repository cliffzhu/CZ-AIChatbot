# Issue #25 — CSP, Versioned GitHub Pages, and Fork Customization Guide

This document summarizes recommended Content Security Policy (CSP) settings, a versioned GitHub Pages/static CDN structure, and a short guide for fork customization to help contributors deploy and secure the widget.

## Content Security Policy (CSP) - Recommended Baseline

- Default-src: `'none'`
- Script-src: `'self'` plus trusted CDN(s) for loader (e.g. `https://cdn.yourdomain.com`) and hashes/nonce when embedding dynamic code.
- Connect-src: API endpoints and allowed origins (e.g. `https://api.yourdomain.com`), WebSocket endpoints as needed.
- Frame-ancestors: specific allowed host(s) or `'none'` if using sandboxed iframe configuration on hosting side.
- Img-src: trusted image hosts and `data:` only when necessary.
- Style-src: `'self'` and trusted CDN for fonts/styles; avoid `unsafe-inline` where possible (use hashes or nonce).
- Base policy example (adjust for your domains):

```
Content-Security-Policy: default-src 'none'; script-src 'self' https://cdn.yourdomain.com; connect-src https://api.yourdomain.com; img-src 'self' https://images.yourdomain.com data:; style-src 'self' https://fonts.googleapis.com 'sha256-...'; frame-ancestors 'self' https://your-allowed-host.com;
```

Notes:
- Use nonces or script/style hashes for any inline code injected by CI or deploy pipelines.
- Keep the iframe's CSP tight and let the loader only mount a sandboxed iframe with minimal privileges.
- Validate and sanitize any URLs returned in message schemas.

## Versioned GitHub Pages / Static CDN Structure

- Use semantic versioning directories or tags for static assets:
  - `https://cdn.yourdomain.com/v1/loader.min.js`
  - `https://cdn.yourdomain.com/v1/iframe/` → contains built `index.html` and assets
- GitHub Pages options:
  - Serve from `gh-pages` branch with a versioned folder per release (e.g., `/v1/`, `/v1.2.0/`).
  - Alternatively, use a `docs/` folder per branch and publish from named branches for each major release.
- Release process:
  1. Build iframe and loader
  2. Publish artifacts to `gh-pages` under `/vX.Y.Z/`
  3. Update loader default CDN pointer and release notes

Cacheing & invalidation:
- Use immutable asset names (content-hashed filenames) and long TTLs for assets under a version folder.
- To roll back, point the canonical loader URL to an earlier version directory.

## Fork Customization Guide (short)

For maintainers or forks that want to customize behavior:

- Update widget configuration endpoint: `/widget/:id/config` — set `allowedOrigins`, theme, and runtime flags.
- CSP: Ensure your deployment adds/adjusts CSP headers to include your CDN and API origins.
- CDN/Loader: Replace CDN URLs in the loader embed snippet with your fork's CDN or GitHub Pages URL.
- Branding/Theming: Provide a theme object via the config API rather than editing built assets where possible.
- Security: Keep JWT secret and token lifetimes configurable; prefer HttpOnly cookies for session tokens.

## Quick Checklist for Deployers

- [ ] Build `chat-widget-iframe` and `chat-widget-loader` with pinned versions
- [ ] Publish to `/vX.Y.Z/` on your static host or `gh-pages`
- [ ] Add CSP headers including CDN + API endpoints
- [ ] Configure backend `allowedOrigins` and token settings
- [ ] Verify embedding and run `test-integration.html`

---

For detailed deployment and policy tailoring, see the repository's `DEPLOYMENT.md` and `TROUBLESHOOTING.md`.
