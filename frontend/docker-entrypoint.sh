#!/bin/sh
set -e

if [ ! -f "/app/node_modules/.package-lock.json" ] && [ ! -f "/app/node_modules/vite/package.json" ]; then
  echo ">>> node_modules missing, running npm install..."
  npm install --no-audit --no-fund
fi

echo ">>> Starting Vite..."
exec ./node_modules/.bin/vite --host
