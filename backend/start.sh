set -e

echo "Starting Redis..."
redis-server --daemonize yes --bind 127.0.0.1 --port 6379

until redis-cli ping > /dev/null 2>&1; do
  echo "Waiting for Redis..."
  sleep 0.5
done
echo "Redis is up."

echo "Starting worker..."
node src/workers/download.worker.js &

echo "Starting API..."
exec node src/server.js
