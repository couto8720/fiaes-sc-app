describe("Admin Authentication", () => {
  it("displays login page", () => {
    cy.visit("/admin/login");
    cy.contains("Entrar", { matchCase: false }).should("exist");
  });

  it("login form has email and password fields", () => {
    cy.visit("/admin/login");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.get('button[type="submit"]').should("exist");
  });

  it("displays OAuth options", () => {
    cy.visit("/admin/login");
    cy.contains("Google", { matchCase: false }).should("exist");
    cy.contains("Microsoft", { matchCase: false }).should("exist");
  });

  it("shows password reset link", () => {
    cy.visit("/admin/login");
    cy.contains("Esqueceu a palavra-passe", { matchCase: false }).should("exist");
  });
});
