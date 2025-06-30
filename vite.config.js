import { defineConfig } from 'vite';

export default defineConfig({
  base: '/static/dist/',
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main: './static/js/main.js',
        style: './static/css/style.css',
        charts: './static/js/charts.js',
        dashboard: './static/js/dashboard.js',
        movimentacoes: './static/js/movimentacoes.js',
        produtos: './static/js/produtos.js',
        api: './static/js/api.js',
      },
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    },
    outDir: './static/dist' // Specify output directory
  }
});