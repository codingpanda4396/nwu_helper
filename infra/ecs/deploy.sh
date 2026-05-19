#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/nwu_helper}"
RELEASE="${RELEASE:-manual}"
PACKAGE="${PACKAGE:-/tmp/nwu-helper.tar.gz}"
ENV_FILE="${ENV_FILE:-}"
KEEP_RELEASES="${KEEP_RELEASES:-3}"

log() {
  printf '[deploy] %s\n' "$*"
}

run_compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    log "Docker Compose is not installed"
    exit 1
  fi
}

if ! command -v docker >/dev/null 2>&1; then
  log "Docker is not installed"
  exit 1
fi

if [ ! -f "$PACKAGE" ]; then
  log "Package not found: $PACKAGE"
  exit 1
fi

mkdir -p "$APP_DIR/releases" "$APP_DIR/shared"
RELEASE_DIR="$APP_DIR/releases/$RELEASE"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

log "Extracting $PACKAGE to $RELEASE_DIR"
tar -xzf "$PACKAGE" -C "$RELEASE_DIR"

if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$APP_DIR/shared/.env"
fi

if [ ! -f "$APP_DIR/shared/.env" ]; then
  log "Missing $APP_DIR/shared/.env"
  exit 1
fi

cp "$APP_DIR/shared/.env" "$RELEASE_DIR/.env"
ln -sfn "$RELEASE_DIR" "$APP_DIR/current"

cd "$APP_DIR/current"
log "Building and starting containers"
run_compose -f docker-compose.prod.yml --env-file .env up -d --build --remove-orphans

log "Container status"
run_compose -f docker-compose.prod.yml --env-file .env ps

log "Pruning old Docker layers"
docker image prune -f >/dev/null 2>&1 || true

log "Keeping latest $KEEP_RELEASES releases"
find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 -type d | sort -r | awk "NR>$KEEP_RELEASES" | xargs rm -rf 2>/dev/null || true

log "Done"
