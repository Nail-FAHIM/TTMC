#!/usr/bin/env bash
# Lance backend + frontend en développement
set -e

ROOT=$(cd "$(dirname "$0")" && pwd)

echo "▸ Démarrage backend FastAPI…"
cd "$ROOT/backend"
uvicorn main:app --port 8000 --reload &
BACKEND_PID=$!

echo "▸ Démarrage frontend Vite…"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ TTMC lancé !"
echo "  → Ouvrir : http://localhost:5173"
echo "  → API    : http://localhost:8000"
echo ""
echo "Ctrl+C pour arrêter."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
