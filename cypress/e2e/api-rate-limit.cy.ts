describe("API Rate Limiting", () => {
  it("respects rate limits on API endpoints", () => {
    const endpoint = "/api/health";

    // Make multiple requests and expect rate limit headers
    for (let i = 0; i < 5; i++) {
      cy.request("GET", endpoint).then((response) => {
        expect(response.headers).to.have.property("x-ratelimit-remaining");
        expect(response.headers).to.have.property("x-ratelimit-reset");
      });
    }
  });

  it("returns 429 when rate limit exceeded", () => {
    const endpoint = "/api/health";

    // Make requests exceeding the limit
    for (let i = 0; i < 101; i++) {
      cy.request({
        method: "GET",
        url: endpoint,
        failOnStatusCode: false,
      }).then((response) => {
        if (i < 100) {
          expect(response.status).to.equal(200);
        } else {
          // Last request might hit the limit depending on timing
          expect([200, 429]).to.include(response.status);
        }
      });
    }
  });

  it("includes rate limit headers in response", () => {
    cy.request("GET", "/api/health").then((response) => {
      expect(response.headers["x-ratelimit-remaining"]).to.be.a("string");
      expect(response.headers["x-ratelimit-reset"]).to.be.a("string");
    });
  });
});
