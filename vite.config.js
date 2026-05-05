import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',   // Relative paths — required for college server sub-directory deployment
  server: {
    port: 5173,
  },
});

