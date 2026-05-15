import fs from 'fs';
import path from 'path';

const defaultConfig = {
    database: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'node_mysql_api'
    },
    secret: '',
    emailFrom: '',
    smtpOptions: {
        host: '',
        port: 587,
        auth: {
            user: '',
            pass: ''
        }
    }
};

function loadFileConfig() {
    const configPath = path.join(__dirname, '..', 'config.json');
    if (!fs.existsSync(configPath)) return defaultConfig;
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

const config = loadFileConfig();

function env(name: string, fallback?: any) {
    const value = process.env[name];
    return value === undefined || value === '' ? fallback : value;
}

function envNumber(name: string, fallback: number) {
    const value = env(name);
    return value ? Number(value) : fallback;
}

function envBoolean(name: string, fallback = false) {
    const value = env(name);
    if (value === undefined) return fallback;
    return ['true', '1', 'yes'].includes(String(value).toLowerCase());
}

const databaseUrl = env('DATABASE_URL', env('MYSQL_URL'));
const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : null;

const database = {
    host: env('DB_HOST', parsedDatabaseUrl?.hostname || config.database.host),
    port: envNumber('DB_PORT', parsedDatabaseUrl?.port ? Number(parsedDatabaseUrl.port) : config.database.port),
    user: env('DB_USER', parsedDatabaseUrl ? decodeURIComponent(parsedDatabaseUrl.username) : config.database.user),
    password: env('DB_PASSWORD', parsedDatabaseUrl ? decodeURIComponent(parsedDatabaseUrl.password) : config.database.password),
    database: env('DB_NAME', parsedDatabaseUrl?.pathname ? parsedDatabaseUrl.pathname.replace('/', '') : config.database.database),
    ssl: envBoolean('DB_SSL', false),
    createDatabase: envBoolean('DB_CREATE_DATABASE', !databaseUrl && config.database.host === 'localhost')
};

const smtpOptions = {
    host: env('SMTP_HOST', config.smtpOptions.host),
    port: envNumber('SMTP_PORT', config.smtpOptions.port),
    auth: {
        user: env('SMTP_USER', config.smtpOptions.auth.user),
        pass: env('SMTP_PASS', config.smtpOptions.auth.pass)
    }
};

export default {
    database,
    secret: env('JWT_SECRET', config.secret),
    emailFrom: env('EMAIL_FROM', config.emailFrom),
    emailDelivery: env('EMAIL_DELIVERY', 'smtp'),
    sendGridApiKey: env('SENDGRID_API_KEY', ''),
    smtpOptions,
    corsOrigins: env('CORS_ORIGIN', env('CORS_ORIGINS', '')).split(',').map((origin: string) => origin.trim()).filter(Boolean),
    cookieSameSite: env('COOKIE_SAMESITE', 'lax'),
    cookieSecure: envBoolean('COOKIE_SECURE', process.env.NODE_ENV === 'production')
};
