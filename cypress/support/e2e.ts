// Cypress support file for E2E tests
// Place any custom commands or utilities here

// Example: Custom command to login
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/admin/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("not.include", "/admin/login");
});

// Example: Custom command to visit a tournament
Cypress.Commands.add("visitTournament", (tournamentId: string) => {
  cy.visit(`/torneios/${tournamentId}`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      visitTournament(tournamentId: string): Chainable<void>;
    }
  }
}

export {};
