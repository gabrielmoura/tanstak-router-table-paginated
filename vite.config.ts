import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import sri from '@small-tech/vite-plugin-sri'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      routeFileIgnorePrefix: '-', // Ignora arquivos que começam com "-"
    }),
    tsconfigPaths(),
    sri(),

  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-icons')) {
            return 'react-icons'
          }
          if (id.includes('node_modules/@faker-js')) {
            return 'faker'
          }
          if (id.includes('node_modules') && !id.includes('react-icons') && !id.includes('@faker-js')) {
            return 'vendor'
          }

        }
      },
      cache: true,
    }
  }
});
