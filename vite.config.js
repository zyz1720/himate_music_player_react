import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import zipPack from 'vite-plugin-zip-pack';

export default defineConfig({
  base: './',
  server: {
    hot: true,
    host: true,
    https: false,
    port: 8081,
    cors: true,
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:3000/",
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, "")
    //   }
    // }
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    // 打包zip
    zipPack({
      inDir: 'dist',
      outDir: 'archive',
      outFileName: 'dist.zip',
      pathPrefix: '',
    }),
  ],
});
