export class SearchBar {
  static readonly SEARCH_ALIAS = "searchRequest";

  private input() { return cy.getByTestId("search-keyword"); }
  private searchButton() { return cy.getByTestId("search-trigger-button"); }
  private clearBtn() { return cy.get('[class*="clear-button"]'); }

  typeQuery(keyword: string): this {
    this.input().should("be.visible").clear();
    this.input().type(keyword);
    return this;
  }

  clickSearchButton(): this {
    this.searchButton().should("be.visible").click();
    return this;
  }

  interceptSearch(): this {
    cy.intercept("GET", "**/my/transactions**").as(SearchBar.SEARCH_ALIAS);
    return this;
  }

  search(keyword: string): this {
    this.interceptSearch();
    this.typeQuery(keyword).clickSearchButton();
    cy.wait(`@${SearchBar.SEARCH_ALIAS}`);
    return this;
  }

  clear(): this {
    this.clearBtn().click();
    return this;
  }

  assertVisible(): this {
    this.input().should("be.visible");
    return this;
  }

  assertHasValue(value: string): this {
    this.input().should("have.value", value);
    return this;
  }

  assertEmpty(): this {
    this.input().should("have.value", "");
    return this;
  }

  assertAllApiResultsContainKeyword(keyword: string): this {
    cy.get(`@${SearchBar.SEARCH_ALIAS}`).then((interception: any) => {
      const response = interception.response;
      expect(response!.statusCode).to.eq(200);
      const transactions: Array<{
        id: string | null;
        title: string | null;
        subtitle: string | null;
        reference: string | null;
        sender: { iban: string } | null;
        receiver: { iban: string } | null;
        partner: { iban: string } | null;
        categories: Array<{ subCategory: string }> | null;
      }> = response!.body.collection;

      const kw = keyword.toLowerCase();
      const allMatch = transactions.every((t) => {
        const fields = [
          t.id,
          t.title,
          t.subtitle,
          t.reference,
          t.sender?.iban,
          t.receiver?.iban,
          t.partner?.iban,
          ...(t.categories?.map((c) => c.subCategory) ?? []),
        ].filter((f): f is string => typeof f === "string");

        return fields.some((f) => f.toLowerCase().includes(kw));
      });

      expect(allMatch, `every API result contains keyword "${keyword}"`).to.be.true;
    });
    return this;
  }
}
