#!/bin/bash
# Build frontend + backend, copie SPA dans l’API, redémarrage PM2.
# Usage : ./scripts/deploy.sh [production|development]
# Variables : backend/.env, ou deployment-env.json local (non versionné).

set -e

ENV=${1:-production}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case $ENV in
    development)
        DEPLOY_ENV="pre_prod"
        ;;
    production)
        DEPLOY_ENV="production"
        ;;
    *)
        DEPLOY_ENV="production"
        ;;
esac

cd "$PROJECT_DIR"
APP_NAME=$(DEPLOY_ENV=$DEPLOY_ENV node -e "const c = require('./ecosystem.config.js'); console.log(c.apps[0].name)" 2>/dev/null | tail -1)

if [ -z "$APP_NAME" ]; then
    echo "Impossible de lire le nom de l'application depuis ecosystem.config.js"
    exit 1
fi

echo "Déploiement ($ENV → DEPLOY_ENV=$DEPLOY_ENV, PM2=$APP_NAME)"

echo "Dépendances et build backend..."
cd "$PROJECT_DIR/backend"
yarn install --production=false
yarn build

echo "Build frontend..."
cd "$PROJECT_DIR/frontend"
yarn install
yarn build

echo "Copie de la SPA vers backend/dist/public..."
cd "$PROJECT_DIR"
mkdir -p backend/dist/public
rm -rf backend/dist/public/*
cp -r frontend/dist/* backend/dist/public/

echo "Redémarrage PM2 ($APP_NAME)..."
cd "$PROJECT_DIR"
set +e
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    pm2 delete "$APP_NAME" 2>/dev/null
    sleep 1
fi
set -e

DEPLOY_ENV=$DEPLOY_ENV pm2 start ecosystem.config.js --env $DEPLOY_ENV
sleep 5
pm2 save

echo "Déploiement terminé. Logs : pm2 logs $APP_NAME"
