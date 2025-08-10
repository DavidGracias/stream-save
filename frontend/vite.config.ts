import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Optimize dev server performance
    hmr: {
      overlay: false
    }
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material']
        }
      }
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@emotion/react', 
      '@emotion/styled', 
      'prop-types', 
      'react-is'
    ],
    exclude: ['@mui/material', '@mui/icons-material'],
    esbuildOptions: {
      // Force CommonJS resolution for problematic packages
      mainFields: ['module', 'main'],
      resolveExtensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    }
  },
  // Performance optimizations
  define: {
    // Remove console logs in production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  // Resolve specific module issues
  resolve: {
    alias: {
      'hoist-non-react-statics': 'hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js',
      'prop-types': 'prop-types/index.js'
    }
  }
})
