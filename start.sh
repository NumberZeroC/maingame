#!/bin/bash
cd /root/maingame

# Load environment
export $(grep -v '^#' .env | xargs)

echo "=== Starting AI Game Platform ==="
echo "Environment: $NODE_ENV"
echo "Database: $DB_HOST"
echo ""

# Kill existing processes
pkill -f "nest start" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "main.js" 2>/dev/null
sleep 2

echo "Building server..."
npm run build --workspace=server

echo "Starting backend server..."
cd server
node dist/src/main.js &
SERVER_PID=$!
cd ..

sleep 3

echo "Starting frontend..."
cd web
npm run dev &
WEB_PID=$!
cd ..

sleep 5

echo ""
echo "=== Service Status ==="
echo "Backend PID: $SERVER_PID"
echo "Frontend PID: $WEB_PID"
echo ""
echo "=== Ports ==="
ss -tlnp | grep -E "3000|4000" || echo "Checking ports..."
echo ""
echo "=== Access URLs ==="
echo "Frontend: http://39.103.62.23:3000"
echo "Backend:  http://39.103.62.23:4000"
echo "API Docs: http://39.103.62.23:4000/api"
echo ""
echo "Press Ctrl+C to stop services"

wait