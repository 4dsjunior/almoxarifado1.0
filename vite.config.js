import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        // CSS principal
        style: resolve(__dirname, 'static/css/style.css'),
        
        // JavaScript modules
        main: resolve(__dirname, 'static/js/main.js'),
        charts: resolve(__dirname, 'static/js/charts.js'),
        dashboard: resolve(__dirname, 'static/js/dashboard.js'),
        movimentacoes: resolve(__dirname, 'static/js/movimentacoes.js'),
        produtos: resolve(__dirname, 'static/js/produtos.js'),
        api: resolve(__dirname, 'static/js/api.js'),
        'ui-utils': resolve(__dirname, 'static/js/ui-utils.js'),
      },
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    },
    outDir: resolve(__dirname, 'static/dist'),
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    cors: true, // Enable CORS
    hmr: {
      host: 'localhost',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'static')
    }
  }
});