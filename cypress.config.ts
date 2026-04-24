import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";

export default defineConfig({
  e2e: {
    baseUrl: "https://george.fat3.sparkasse.at",
    specPattern: ["cypress/e2e/**/*.feature", "cypress/e2e/**/*.cy.ts"],
    supportFile: "cypress/utils/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 15_000,
    pageLoadTimeout: 30_000,
    video: false,
    screenshotOnRunFailure: true,

    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
          sourcemap: "inline",
        })
      );

      return config;
    },
  },
});
