#!/usr/bin/env bash
set -euo pipefail

# Usage: update-docs-latest.sh VERSION
VERSION=${1:-}
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <VERSION>" >&2
  exit 2
fi

BRANCH="docs/update-${VERSION}"
echo "Preparing docs update branch: $BRANCH"

git fetch origin
git checkout -b "$BRANCH"

# If docs/latest exists, rename it to next V#
if [ -d docs/latest ]; then
  echo "docs/latest exists — determining next V#"
  mkdir -p docs
  # find existing V directories like V1, V2
  max=0
  for d in docs/V*; do
    if [ -d "$d" ]; then
      name=$(basename "$d")
      if [[ $name =~ ^V([0-9]+)$ ]]; then
        n=${BASH_REMATCH[1]}
        if [ "$n" -gt "$max" ]; then
          max=$n
        fi
      fi
    fi
  done
  next=$((max+1))
  newdir="docs/V${next}"
  echo "Renaming docs/latest -> $newdir"
  git mv docs/latest "$newdir"
fi

mkdir -p docs/latest

# Copy prepared artifacts from out/<VERSION> if present, else from dist/standalone
if [ -d "out/${VERSION}" ]; then
  echo "Using out/${VERSION} for docs content"
  cp -r out/${VERSION}/* docs/latest/
else
  echo "out/${VERSION} not found, attempting dist/standalone and chat-widget-iframe/dist"
  mkdir -p docs/latest/iframe
  mkdir -p docs/latest/loader
  if [ -d chat-widget-iframe/dist ]; then
    cp -r chat-widget-iframe/dist/* docs/latest/iframe/ || true
  fi
  if [ -f chat-widget-loader/dist/loader.min.js ]; then
    cp chat-widget-loader/dist/loader.min.js docs/latest/loader/ || true
  fi
  if [ -d dist/standalone ]; then
    mkdir -p docs/latest/standalone
    cp -r dist/standalone/* docs/latest/standalone/ || true
  fi
fi

git add docs
if git diff --cached --quiet; then
  echo "No docs changes to commit"
  exit 0
fi

git commit -m "chore(docs): publish ${VERSION} to docs/latest"
git push --set-upstream origin "$BRANCH"

echo "Pushed docs branch: $BRANCH"
