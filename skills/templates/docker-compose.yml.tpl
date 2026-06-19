services:
  ${SERVICE_NAME}:
    container_name: \${CONTAINER_NAME}
    restart: always
    networks:
      - 1panel-network
    ports:
      - "\${PANEL_APP_PORT_HTTP}:${PORT}"
    volumes:
      - ./data/data:/app/data
    environment:
      - PUID=0
      - PGID=0
      - UMASK=022
    image: ${IMAGE}:${TAG}
    labels:
      createdBy: "Apps"
networks:
  1panel-network:
    external: true
