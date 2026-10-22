#!/usr/bin/env bash
# Ghép src/ thành MỘT file HTML chạy offline: dist/index.html (và docs/index.html cho GitHub Pages)
set -euo pipefail
cd "$(dirname "$0")"
for f in src/js/*.js; do node --check "$f"; done
node tools/build.js
echo "OK -> dist/index.html ($(wc -c < dist/index.html) bytes)"
