import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from the parent directory (stream-save) where MongoDB.env is located
  const env = loadEnv(mode, resolve(__dirname, '..'), '')

  // Also manually load MongoDB.env since loadEnv doesn't pick up custom named files
  const mongoEnvPath = resolve(__dirname, '..', 'MongoDB.env');

  let mongoEnvVars: Record<string, string> = {};
  if (existsSync(mongoEnvPath)) {
    const mongoEnvContent = readFileSync(mongoEnvPath, 'utf8');
    mongoEnvContent.split('\n').forEach((line: string) => {
      const [key, value] = line.split('=');
      if (key && value) {
        mongoEnvVars[key.trim()] = value.trim();
      }
    });
  }

  // Merge the loaded env with our custom MongoDB.env
  const finalEnv = { ...env, ...mongoEnvVars };

  return {
    plugins: [react()],
    define: {
      // Make MongoDB env variables available to the client
      'import.meta.env.VITE_MONGO_USERNAME': JSON.stringify(finalEnv.MONGO_USERNAME || ''),
      'import.meta.env.VITE_MONGO_PASSWORD': JSON.stringify(finalEnv.MONGO_PASSWORD || ''),
      'import.meta.env.VITE_MONGO_CLUSTER_URL': JSON.stringify(finalEnv.MONGO_CLUSTER_URL || ''),
      'import.meta.env.VITE_MONGO_CLUSTER_NAME': JSON.stringify(finalEnv.MONGO_CLUSTER_NAME || ''),
    },
    envDir: resolve(__dirname, '..'), // Look for .env files in parent directory
    server: {
      // Show console logs in terminal
      hmr: {
        overlay: false
      }
    }
  }
})
