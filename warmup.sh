#!/bin/bash
# Start Next.js and warm up Payload by hitting the API
next start -p ${PORT:-3000} &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
for i in $(seq 1 30); do
  sleep 2
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT:-3000}/api/users 2>/dev/null | grep -q "200\|401\|403"; then
    echo "Server ready after $((i*2))s"
    break
  fi
done

# Keep the server running
wait $SERVER_PID
