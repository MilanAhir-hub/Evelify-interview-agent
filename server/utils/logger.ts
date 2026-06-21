import winston from 'winston';

const sensitiveKeys = [
    'token',
    'password',
    'secret',
    'idtoken',
    'signature',
    'key_secret',
    'api_key',
    'key'
];

const sanitize = (val: any): any => {
    if (!val) return val;
    if (typeof val !== 'object') return val;

    if (Array.isArray(val)) {
        return val.map(sanitize);
    }

    const res: Record<string, any> = {};
    for (const key of Object.keys(val)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            res[key] = '[REDACTED]';
        } else if (typeof val[key] === 'object') {
            res[key] = sanitize(val[key]);
        } else {
            res[key] = val[key];
        }
    }
    return res;
};

const sanitizeFormat = winston.format((info) => {
    // Sanitize metadata fields
    for (const key of Object.keys(info)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            info[key] = '[REDACTED]';
        } else if (typeof info[key] === 'object') {
            info[key] = sanitize(info[key]);
        }
    }

    // Sanitize message if it is an object
    if (typeof info.message === 'object') {
        info.message = sanitize(info.message);
    }

    return info;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        sanitizeFormat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'evelify-api' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
                    return `[${timestamp}] [${level}] [${service}]: ${msg}${metaStr}`;
                })
            )
        })
    ],
});

export default logger;
