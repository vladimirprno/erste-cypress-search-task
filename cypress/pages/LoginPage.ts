const LOGIN_ORIGIN = "https://login.fat.sparkasse.at";

class LoginPage {
  performLogin(username: string, password: string): this {
    cy.visit("/");
    cy.origin(
      LOGIN_ORIGIN,
      { args: { username, password } },
      ({ username, password }) => {
        cy.get("#user").should("be.visible").type(username);
        cy.get("input#submitButton").click();
        cy.get("#secret").should("be.visible").type(password);
        cy.get("input#submitButton").click();
      }
    );
    return this;
  }

  assertLoggedIn(): this {
    cy.url().should("include", "george.fat3.sparkasse.at");
    return this;
  }
}

export const loginPage = new LoginPage();
