const fs = require('fs')
const path = require('path')

/**
 * Fichier .env à charger pour PM2.
 * 1. DEPLOY_ENV_FILE (chemin explicite)
 * 2. deployment-env.json local s’il existe (non versionné)
 * 3. backend/.env
 */
function resolveEnvFile() {
  if (process.env.DEPLOY_ENV_FILE) {
    return process.env.DEPLOY_ENV_FILE
  }

  const mapPath = path.join(__dirname, 'deployment-env.json')
  if (fs.existsSync(mapPath)) {
    const deploymentEnv = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
    const deployEnvRaw = process.env.DEPLOY_ENV || 'prod'
    const envMapping = {
      production: 'prod',
      pre_prod: 'pre-prod',
      prod: 'prod'
    }
    const configKey = envMapping[deployEnvRaw] || deployEnvRaw
    return deploymentEnv[configKey] || deploymentEnv.prod || ''
  }

  const backendEnv = path.join(__dirname, 'backend', '.env')
  return fs.existsSync(backendEnv) ? backendEnv : ''
}

const envFile = resolveEnvFile()
if (envFile) {
  console.log(`Chargement des variables depuis: ${envFile}`)
}

function loadEnvFile(filePath) {
  const env = {}
  if (!filePath || !fs.existsSync(filePath)) {
    if (filePath) {
      console.warn(`Fichier d'environnement non trouvé: ${filePath}`)
    }
    return env
  }
  const content = fs.readFileSync(filePath, 'utf8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        env[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
  console.log(`Fichier chargé: ${Object.keys(env).length} variables trouvées`)
  return env
}

const envVars = loadEnvFile(envFile)

const getEnvVar = (key, required = false) => {
  const value = process.env[key] || envVars[key]
  if (!value && required) {
    console.warn(`Variable ${key} non définie`)
  }
  return value
}

const sharedEnv = {
  PGHOST: getEnvVar('PGHOST'),
  PGDATABASE: getEnvVar('PGDATABASE'),
  PGPORT: getEnvVar('PGPORT'),
  PGUSER: getEnvVar('PGUSER'),
  PGPASSWORD: getEnvVar('PGPASSWORD'),
  PGTABLEUSER: getEnvVar('PGTABLEUSER'),
  PGSSLMODE: getEnvVar('PGSSLMODE'),
  PGSCHEMA: getEnvVar('PGSCHEMA'),
  PGSSL_REJECT_UNAUTHORIZED: getEnvVar('PGSSL_REJECT_UNAUTHORIZED'),
  SESSION: getEnvVar('SESSION', false),
  GEOSERVER_URL: getEnvVar('GEOSERVER_URL'),
  GEOSERVER_NAMESPACE: getEnvVar('GEOSERVER_NAMESPACE'),
  GEOSERVER_COMMUNES_LAYER: getEnvVar('GEOSERVER_COMMUNES_LAYER'),
  COMMUNES_GEOJSON_PATH: getEnvVar('COMMUNES_GEOJSON_PATH')
}

const app = {
  name: 'portrait-com-v2',
  script: './backend/dist/server.js',
  cwd: __dirname,
  instances: 1,
  autorestart: true,
  watch: false,
  error_file: './logs/err.log',
  out_file: './logs/out.log',
  log_file: './logs/combined.log',
  time: true,
  env: {
    NODE_ENV: 'development',
    PORT: 8163,
    ...sharedEnv
  },
  env_pre_prod: {
    NODE_ENV: 'production',
    PORT: 8163,
    ...sharedEnv
  },
  env_production: {
    NODE_ENV: 'production',
    PORT: 8151,
    ...sharedEnv
  }
}

if (envFile) {
  app.env_file = envFile
}

module.exports = { apps: [app] }
