import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://olvasosziget-4c5e8.web.app/',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
  env: {
    alias: {
      '@components': '/src/components',
      '@services': '/src/services',
      '@config': '/src/config',
      '@assets': '/src/assets',
      '@models': '/src/models',
    },
  },
});
