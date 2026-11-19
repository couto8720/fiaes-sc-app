describe("Tournaments Public Page", () => {
  beforeEach(() => {
    cy.visit("/torneios");
  });

  it("displays tournaments page title", () => {
    cy.contains("Torneios", { matchCase: false }).should("exist");
  });

  it("displays tournament list", () => {
    cy.get("[data-testid='tournament-card']", { timeout: 5000 }).should("exist");
  });

  it("tournament cards are clickable", () => {
    cy.get("a[href*='/torneios/']").first().should("be.visible").click();
    cy.url().should("include", "/torneios/");
  });
});
