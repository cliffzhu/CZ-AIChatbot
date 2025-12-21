#!/usr/bin/env bash
# Simple smoke test to verify published GitHub Pages artifacts
set -euo pipefail

OWNER=${1:-}
REPO_NAME=${2:-}
VERSION=${3:-}

if [ -z "$OWNER" ] || [ -z "$REPO_NAME" ] || [ -z "$VERSION" ]; then
  echo "Usage: $0 <owner> <repo> <version>"
  exit 2
fi

PAGES_BASE="https://${OWNER}.github.io/${REPO_NAME}/${VERSION}"
LATEST_BASE="https://${OWNER}.github.io/${REPO_NAME}/latest"

echo "Checking ${PAGES_BASE} and ${LATEST_BASE}"

retry() {
  local n=0
  until [ $n -ge 24 ]
  do
    "$@" && return 0
    n=$((n+1))
    sleep 5
  done
  return 1
}

retry curl -sfS ${PAGES_BASE}/loader/loader.min.js -o /dev/null || { echo "Failed to fetch loader"; exit 1; }
retry curl -sfS ${PAGES_BASE}/iframe/index.html -o /dev/null || { echo "Failed to fetch iframe index"; exit 1; }
retry curl -sfS ${LATEST_BASE}/loader/loader.min.js -o /dev/null || { echo "Failed to fetch latest loader"; exit 1; }
retry curl -sfS ${LATEST_BASE}/iframe/index.html -o /dev/null || { echo "Failed to fetch latest iframe index"; exit 1; }

echo "Smoke test passed: published artifacts are reachable."
