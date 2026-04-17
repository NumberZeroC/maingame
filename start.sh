#!/bin/bash
cd /root/maingame

echo "Starting backend server..."
cd server
npm run dev &
SERVER_PID=$!
cd ..

echo "Starting frontend..."
cd web
npm run dev &
WEB_PID=$!
cd ..

echo "Waiting for services to start..."
sleep 10

echo ""
echo "=== Service Status ==="
echo "Backend PID: $SERVER_PID"
echo "Frontend PID: $WEB_PID"
echo ""
echo "=== Ports ==="
ss -tlnp | grep -E "3000|4000"
echo ""
echo "=== Access URLs ==="
echo "Frontend: http://8.130.165.124:3000"
echo "Backend:  http://8.130.165.124:4000"
echo "API Docs: http://8.130.165.124:4000/api"
echo ""
echo "Press Ctrl+C to stop services"

wait