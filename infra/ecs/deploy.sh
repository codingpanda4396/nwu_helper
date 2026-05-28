#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/nwu_helper}"
RELEASE="${RELEASE:-manual}"
PACKAGE="${PACKAGE:-/tmp/nwu-helper.tar.gz}"
ENV_FILE="${ENV_FILE:-}"
IMAGES_PACKAGE="${IMAGES_PACKAGE:-}"
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
if [ -n "$IMAGES_PACKAGE" ] && [ -f "$IMAGES_PACKAGE" ]; then
  log "Loading Docker images from $IMAGES_PACKAGE"
  gzip -dc "$IMAGES_PACKAGE" | docker load
  log "Starting containers from prebuilt images"
  run_compose -f docker-compose.prod.yml --env-file .env up -d --no-build --remove-orphans
else
  log "Building and starting containers"
  run_compose -f docker-compose.prod.yml --env-file .env up -d --build --remove-orphans
fi

log "Waiting for database to be ready"
for i in $(seq 1 30); do
  if run_compose -f docker-compose.prod.yml --env-file .env ps postgres 2>/dev/null | grep -q "healthy"; then
    log "Database is ready"
    break
  fi
  log "Waiting for database... attempt $i"
  sleep 3
done

log "Applying database migrations"
run_compose -f docker-compose.prod.yml --env-file .env exec -T api pnpm db:migrate

log "Container status"
run_compose -f docker-compose.prod.yml --env-file .env ps

log "Pruning old Docker layers"
docker image prune -f >/dev/null 2>&1 || true

log "Keeping latest $KEEP_RELEASES releases"
CURRENT_TARGET="$(readlink -f "$APP_DIR/current" 2>/dev/null || true)"
find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 -type d ! -path "$CURRENT_TARGET" -printf '%T@ %p\n' \
  | sort -rn \
  | awk "NR>$KEEP_RELEASES {print \$2}" \
  | xargs -r rm -rf 2>/dev/null || true

log "Done"
