import { SearchBar } from "./components/SearchBar";

class SearchResultsPage {
  readonly searchBar = new SearchBar();

  private transactionList() { return cy.getByTestId("transactions-region"); }
  private transactionItems() { return cy.get('[data-cy^="transaction-list-item-"]'); }
  private emptyState() { return cy.getByTestId("no-search-results"); }

  assertResultsVisible(): this {
    this.transactionList().should("be.visible");
    this.transactionItems().should("have.length.greaterThan", 0);
    return this;
  }

  assertAllTilesContain(keyword: string): this {
    this.transactionItems().each(($item) => {
      cy.wrap($item)
        .invoke("text")
        .then((text) => {
          expect(text.toLowerCase()).to.include(keyword.toLowerCase());
        });
    });
    return this;
  }

  assertEmptyStateVisible(): this {
    this.emptyState().should("be.visible");
    return this;
  }

  assertNoTransactionsVisible(): this {
    this.transactionItems().should("not.exist");
    return this;
  }
}

export const searchResultsPage = new SearchResultsPage();
