#!/usr/bin/env bash
set -euo pipefail

# Build a standalone distribution that bundles iframe app and loader into one folder
# Usage: ./scripts/build-standalone.sh <output-dir>

OUT_DIR=${1:-dist/standalone}

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/iframe"
mkdir -p "$OUT_DIR/loader"

if [ -d "chat-widget-iframe/dist" ]; then
  cp -r chat-widget-iframe/dist/* "$OUT_DIR/iframe/"
else
  echo "Warning: chat-widget-iframe/dist not found. Did you build the iframe?"
fi

if [ -f "chat-widget-loader/dist/loader.min.js" ]; then
  cp chat-widget-loader/dist/loader.min.js "$OUT_DIR/loader/"
else
  echo "Warning: chat-widget-loader/dist/loader.min.js not found. Did you build the loader?"
fi

echo "Standalone distribution created at: $OUT_DIR"
