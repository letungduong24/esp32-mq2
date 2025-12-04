#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."

# Simple check: try to run migrations (it will retry if DB is not ready)
# Prisma migrate deploy will handle retries internally
npx prisma migrate deploy || {
  echo "Waiting for PostgreSQL connection..."
  sleep 5
  npx prisma migrate deploy
}

echo "Migrations completed - starting Next.js..."

# Start Next.js
exec node server.js

