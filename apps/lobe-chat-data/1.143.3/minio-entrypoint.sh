#!/bin/sh

minio server /etc/minio/data --address ":${MINIO_PORT}" --console-address ":9001" &
MINIO_PID=$!

while ! curl -s http://localhost:${MINIO_PORT}/minio/health/live; do
  echo 'Waiting for MinIO to start...'
  sleep 1
done

sleep 5
mc alias set myminio http://localhost:${MINIO_PORT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
echo "Creating bucket ${MINIO_LOBE_BUCKET}"
mc mb myminio/${MINIO_LOBE_BUCKET}

wait $MINIO_PID