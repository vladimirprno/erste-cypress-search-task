import users from "../fixtures/users.json";
import { loginPage } from "../pages/LoginPage";

declare global {
  namespace Cypress {
    interface Chainable {
      login(userType?: keyof typeof users): Chainable<void>;
      getByTestId(dataCy: string): Chainable<JQuery>;
    }
  }
}

Cypress.Commands.add("getByTestId", (dataCy: string) => {
  return cy.get(`[data-cy="${dataCy}"]`);
});

Cypress.Commands.add("login", (userType: keyof typeof users = "standard") => {
  const { username, password } = users[userType];

  cy.session(
    `login-${username}`,
    () => {
      loginPage.performLogin(username, password).assertLoggedIn();
    },
    {
      validate() {
        cy.visit("/");
        cy.url().should("not.include", "login.fat.sparkasse.at");
      },
    }
  );
});
