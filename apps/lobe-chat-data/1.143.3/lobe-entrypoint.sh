#!/bin/sh

/bin/node /app/startServer.js &
LOBE_PID=$!
sleep 3

if [ $(wget --timeout=5 --spider --server-response ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration 2>&1 | grep -c 'HTTP/1.1 200 OK') -eq 0 ]; then
  echo '⚠️Warining: Unable to fetch OIDC configuration from Casdoor'
  echo 'Request URL: ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration'
  echo 'Read more at: https://lobehub.com/docs/self-hosting/server-database/docker-compose#necessary-configuration'
  echo ''
  echo '⚠️注意：无法从 Casdoor 获取 OIDC 配置'
  echo '请求 URL: ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration'
  echo '了解更多：https://lobehub.com/zh/docs/self-hosting/server-database/docker-compose#necessary-configuration'
  echo ''
else
  if ! wget -O - --timeout=5 ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration 2>&1 | grep 'issuer' | grep ${AUTH_CASDOOR_ISSUER}; then
    printf '❌Error: The Auth issuer is conflict, Issuer in OIDC configuration is: %s' $(wget -O - --timeout=5 ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration 2>&1 | grep -E 'issuer.*' | awk -F '"' '{print $4}')
    echo ' , but the issuer in .env file is: ${AUTH_CASDOOR_ISSUER} '
    echo 'Request URL: ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration'
    echo 'Read more at: https://lobehub.com/docs/self-hosting/server-database/docker-compose#necessary-configuration'
    echo ''
    printf '❌错误：Auth 的 issuer 冲突，OIDC 配置中的 issuer 是：%s' $(wget -O - --timeout=5 ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration 2>&1 | grep -E 'issuer.*' | awk -F '"' '{print $4}')
    echo ' , 但 .env 文件中的 issuer 是：${AUTH_CASDOOR_ISSUER} '
    echo '请求 URL: ${AUTH_CASDOOR_ISSUER}/.well-known/openid-configuration'
    echo '了解更多：https://lobehub.com/zh/docs/self-hosting/server-database/docker-compose#necessary-configuration'
    echo ''
  fi
fi

if [ $(wget --timeout=5 --spider --server-response ${S3_ENDPOINT}/minio/health/live 2>&1 | grep -c 'HTTP/1.1 200 OK') -eq 0 ]; then
  echo '⚠️Warining: Unable to fetch MinIO health status'
  echo 'Request URL: ${S3_ENDPOINT}/minio/health/live'
  echo 'Read more at: https://lobehub.com/docs/self-hosting/server-database/docker-compose#necessary-configuration'
  echo ''
  echo '⚠️注意：无法获取 MinIO 健康状态'
  echo '请求 URL: ${S3_ENDPOINT}/minio/health/live'
  echo '了解更多：https://lobehub.com/zh/docs/self-hosting/server-database/docker-compose#necessary-configuration'
  echo ''
fi

wait $LOBE_PID