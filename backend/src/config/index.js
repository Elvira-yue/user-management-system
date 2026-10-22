const path = require('path');
const dotenv = require('dotenv');

// 无论从哪个目录启动，都读取 backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'ums_dev_secret_please_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  defaultPassword: process.env.DEFAULT_PASSWORD || '123456',
  corsOrigin: process.env.CORS_ORIGIN || '',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'user_management',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    logging: process.env.DB_LOGGING === 'true'
  }
};
