import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  HOST: getEnvVar('HOST', 'localhost'),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '24h'),
  UPLOAD_PATH: getEnvVar('UPLOAD_PATH', './src/uploads'),
  MAX_FILE_SIZE: parseInt(getEnvVar('MAX_FILE_SIZE', '5242880'), 10),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:4200'),
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'debug'),
};
