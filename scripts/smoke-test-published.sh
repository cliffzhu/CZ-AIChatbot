#!/usr/bin/env bash
# Simple, configurable smoke test to verify published GitHub Pages artifacts
set -euo pipefail

# Defaults
WAIT_SECS=30
ATTEMPTS=18
DELAY=10

usage() {
  cat <<EOF
Usage: $0 <owner> <repo> <version> [--wait N] [--attempts N] [--delay N]
  --wait     initial wait before checks (seconds), default ${WAIT_SECS}
  --attempts retry attempts per check, default ${ATTEMPTS}
  --delay    delay between retries (seconds), default ${DELAY}
EOF
}

if [ "$#" -lt 3 ]; then
  usage
  exit 2
fi

OWNER=$1
REPO_NAME=$2
VERSION=$3
shift 3

# parse optional flags
while [ "$#" -gt 0 ]; do
  case "$1" in
    --wait)
      WAIT_SECS=${2:-$WAIT_SECS}
      shift 2
      ;;
    --attempts)
      ATTEMPTS=${2:-$ATTEMPTS}
      shift 2
      ;;
    --delay)
      DELAY=${2:-$DELAY}
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 2
      ;;
  esac
done

PAGES_BASE="https://${OWNER}.github.io/${REPO_NAME}/${VERSION}"
LATEST_BASE="https://${OWNER}.github.io/${REPO_NAME}/latest"

echo "Waiting ${WAIT_SECS}s for GitHub Pages to publish..."
sleep ${WAIT_SECS}

echo "Checking ${PAGES_BASE} and ${LATEST_BASE} (attempts=${ATTEMPTS}, delay=${DELAY}s)"

retry() {
  local n=0
  local cmd
  cmd=("$@")
  until [ $n -ge "$ATTEMPTS" ]
  do
    if "${cmd[@]}"; then
      echo "Succeeded: ${cmd[*]}"
      return 0
    fi
    n=$((n+1))
    echo "Attempt $n/${ATTEMPTS} failed for: ${cmd[*]} -- sleeping ${DELAY}s..."
    sleep ${DELAY}
  done
  echo "Command failed after ${ATTEMPTS} attempts: ${cmd[*]}" >&2
  return 1
}

check_or_exit() {
  local url=$1
  if ! retry curl -sfS "$url" -o /dev/null; then
    echo "Failed to fetch $url" >&2
    exit 1
  fi
}

check_or_exit "${PAGES_BASE}/loader/loader.min.js"
check_or_exit "${PAGES_BASE}/iframe/index.html"
check_or_exit "${LATEST_BASE}/loader/loader.min.js"
check_or_exit "${LATEST_BASE}/iframe/index.html"

echo "Smoke test passed: published artifacts are reachable."
