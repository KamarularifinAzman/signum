import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-azure-config',
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'staticwebapp.config.json'),
            resolve(__dirname, 'build/staticwebapp.config.json')
          );
          console.log('✓ Copied staticwebapp.config.json to build folder');
        } catch (err) {
          console.warn('Could not copy staticwebapp.config.json:', err.message);
        }
      }
    }
  ],
  base: '/',
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
