import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CI
      ? 'https://staging.career-connect-lesotho.web.app'
      : 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',

    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },

        table(message) {
          console.table(message);
          return null;
        },
      });

      // Modify config based on environment
      if (process.env.CI) {
        config.video = true;
        config.screenshotOnRunFailure = true;
      }

      return config;
    },

    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
    watchForFileChanges: false,
    chromeWebSecurity: false,
    experimentalStudio: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/component.js',
  },

  env: {
    apiUrl: process.env.CI ? 'https://api.careerconnect.co.ls' : 'http://localhost:5000',
    coverage: true,
    codeCoverage: {
      url: 'http://localhost:3000/__coverage__',
    },
  },

  video: true,
  videoCompression: 32,
  videoUploadOnPasses: false,

  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: true,

  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
  },
});
