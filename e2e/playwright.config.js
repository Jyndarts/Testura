const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 60000,
  retries: 0,
  webServer: [
    {
      command: 'cd ../server && npm start',
      port: 5000,
      timeout: 15000,
      reuseExistingServer: true,
    },
    {
      command: 'cd ../client && npx vite --port 5173',
      port: 5173,
      timeout: 15000,
      reuseExistingServer: true,
    },
  ],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
});
