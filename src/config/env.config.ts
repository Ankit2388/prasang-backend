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
