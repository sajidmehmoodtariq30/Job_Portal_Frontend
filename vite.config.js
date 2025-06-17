import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Use esbuild instead of terser to avoid dependency issues
    minify: 'esbuild',
    // Ensure proper chunking for better loading
    rollupOptions: {
      output: {
        // Prevent potential security issues with dynamic imports
        manualChunks: undefined,
      }
    },
    // Handle potential build issues with OAuth
    sourcemap: false,
  },
  // Handle OAuth redirects properly
  preview: {
    port: 3000,
    host: true
  }
})
