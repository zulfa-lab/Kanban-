import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Helper to auto-sync .env.example into .env if user entered their keys in .env.example
function syncEnvFiles() {
  try {
    const envExamplePath = path.resolve(__dirname, '.env.example');
    const envPath = path.resolve(__dirname, '.env');
    
    if (fs.existsSync(envExamplePath)) {
      const exampleContent = fs.readFileSync(envExamplePath, 'utf-8');
      const match = exampleContent.match(/VITE_FIREBASE_API_KEY=\s*([^\r\n]+)/);
      if (match && match[1] && match[1].trim() !== '') {
        fs.writeFileSync(envPath, exampleContent, 'utf-8');
      }
    }
  } catch (err) {
    console.warn('Could not auto-sync env files:', err);
  }
}

syncEnvFiles();

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'watch-env-example',
      configureServer(server) {
        server.watcher.add(path.resolve(__dirname, '.env.example'));
        server.watcher.on('change', (file) => {
          if (file.endsWith('.env.example')) {
            syncEnvFiles();
            server.restart();
          }
        });
      }
    }
  ],
})
