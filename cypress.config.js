const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://demo.prestashop.com',
    pageLoadTimeout: 60000,
    defaultCommandTimeout: 15000,
    experimentalOriginDependencies: true,
  },
});