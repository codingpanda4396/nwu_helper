#!/usr/bin/env sh
set -eu

log() {
  printf '[bootstrap] %s\n' "$*"
}

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  log "Docker and Docker Compose are already installed"
  exit 0
fi

if ! command -v curl >/dev/null 2>&1; then
  log "curl is required to install Docker"
  exit 1
fi

log "Installing Docker with Docker's official convenience script"
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
sudo systemctl enable --now docker

if ! docker compose version >/dev/null 2>&1; then
  log "Docker Compose plugin is missing after Docker installation"
  exit 1
fi

log "Docker installation complete"
