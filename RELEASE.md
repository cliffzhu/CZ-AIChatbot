# Release & Deployment

This document describes the release workflow and manual steps for deploying the CZ AI Chatbot widget.

Tagging and release
- Create a semver tag, e.g. `v1.2.0` and push it:

```bash
git tag v1.2.0
git push origin v1.2.0
```

- Pushing a tag triggers the `.github/workflows/release.yml` workflow which:
  - Installs dependencies and builds the `chat-widget-iframe` via Vite.
  - Packages the `chat-widget-iframe/dist` into a zip file.
  - Creates a GitHub Release for the tag and uploads the packaged artifact.

CDN / Deployment ideas
- Recommended: publish the loader bundle and iframe assets to a CDN (e.g. Cloudflare, S3+CloudFront).
- After the workflow creates a release, download the artifact and publish `dist` assets to your CDN.

Manual verification
- Download the release artifact from the GitHub Release page and verify the `dist` folder.
- Optionally run the E2E harness locally against a test host server to validate runtime behavior.

Notes
- The release workflow builds the site in CI; do not commit `dist` or `assets` into the repo. Use the CI artifact as the canonical build.
- If you want automated CDN deployment, we can extend the workflow to upload to your CDN provider — you'll need to add deployment secrets to the repository (API keys / credentials).
