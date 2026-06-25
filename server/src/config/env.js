require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key-change-me',
};

if (!env.mongoUri) {
  throw new Error('Missing required environment variable: MONGO_URI');
}

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET not set — using insecure dev default');
}

if (!process.env.ENCRYPTION_KEY) {
  console.warn('ENCRYPTION_KEY not set — using insecure dev default');
}

module.exports = env;
