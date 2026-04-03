#!/bin/sh
set -e

# If node_modules is missing or empty (volume just mounted), install deps
if [ ! -f "/app/node_modules/.package-lock.json" ] && [ ! -f "/app/node_modules/dotenv/package.json" ]; then
  echo ">>> node_modules not found or incomplete, running npm install..."
  npm install --no-audit --no-fund --include=dev
fi

echo ">>> Generating Prisma client..."
npx prisma generate

echo ">>> Starting server..."
exec ./node_modules/.bin/tsx watch src/server.ts
