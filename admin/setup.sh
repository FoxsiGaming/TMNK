#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit values in admin/.env as needed."
fi

echo "Installing npm dependencies..."
npm install

echo "Running DB migration..."
npm run migrate

echo "Seeding initial data..."
npm run seed

echo "Setup complete. Start the server with: npm start"
