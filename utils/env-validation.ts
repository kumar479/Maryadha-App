import Constants from 'expo-constants';

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function validateEnvConfig(): EnvConfig {
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

  const missingVars: string[] = [];

  if (!supabaseUrl) missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');

  if (missingVars.length > 0) {
    throw new ConfigError(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and app.config.js configuration.'
    );
  }

  // Validate Supabase URL format
  try {
    new URL(supabaseUrl);
  } catch (err) {
    throw new ConfigError(
      'Invalid SUPABASE_URL format. Must be a valid URL.'
    );
  }

  // Validate Supabase Anon Key format (should be a JWT)
  if (!supabaseAnonKey.match(/^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/)) {
    throw new ConfigError(
      'Invalid SUPABASE_ANON_KEY format. Must be a valid JWT token.'
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function getEnvConfig(): EnvConfig {
  try {
    return validateEnvConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('Environment Configuration Error:', error.message);
    } else {
      console.error('Unexpected error validating environment:', error);
    }
    throw error;
  }
} 