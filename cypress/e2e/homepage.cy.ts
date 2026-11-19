describe("Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays main navigation", () => {
    cy.get("header").should("exist");
    cy.contains("Fiães SC").should("exist");
  });

  it("displays upcoming games section", () => {
    cy.contains("Próximos jogos", { matchCase: false }).should("exist");
  });

  it("displays recent results section", () => {
    cy.contains("Resultados recentes", { matchCase: false }).should("exist");
  });

  it("navigation links are clickable", () => {
    cy.get("a[href*='/calendario']").should("be.visible");
    cy.get("a[href*='/classificacao']").should("be.visible");
  });
});
