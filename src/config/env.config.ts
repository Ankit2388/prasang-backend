import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Determine environment
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile =
  nodeEnv === 'test' ? '.env.test' : nodeEnv === 'production' ? '.env' : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Define Zod schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),
  PORT: z.coerce.number().default(5001),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  MONGODB_URI: z.string().min(1, { message: 'MONGODB_URI environment variable is required' }),
  AUTH_MODE: z.enum(['password', 'otp']).default('password'),
  JWT_SECRET: z.string().default('prasang_jwt_secret_key_development_2026'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_SECRET: z.string().default('prasang_jwt_refresh_secret_key_development_2026'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().default(5),
  DEFAULT_DEV_OTP: z.string().default('123456'),
});

// Validate environment variables
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error(
      '❌ Invalid environment configuration:',
      JSON.stringify(result.error.format(), null, 2),
    );
    throw new Error(`Invalid environment configuration: ${result.error.message}`);
  }

  return result.data;
};

export const env = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;
