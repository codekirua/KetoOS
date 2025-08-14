import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  return {
    // Vite options
    root: '.',
    base: '/',
    
    // Build options
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        external: [],
        output: {
          format: 'es'
        }
      }
    },

    // Development server options
    server: {
      port: 3000,
      host: true,
      open: true
    },

    // Preview server options
    preview: {
      port: 4173,
      host: true
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __ENV__: JSON.stringify(mode)
    },

    // CSS options
    css: {
      devSourcemap: mode === 'development'
    },

    // Resolve options
    resolve: {
      alias: {
        '@': resolve(__dirname, '.')
      }
    },

    // Public directory
    publicDir: 'public'
  }
})
