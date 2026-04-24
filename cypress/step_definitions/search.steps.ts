import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { searchResultsPage } from "../pages/SearchResultsPage";
import { overviewPage } from "../pages/OverviewPage";

// ── Given ───────────────────────────────────────────────────────────────

Given("I am logged in as a standard user", () => {
  cy.login("standard");
  cy.visit("/");
});

Given("I am on the overview page", () => {
  cy.visit("/");
});

Given("the search API is being monitored", () => {
  searchResultsPage.searchBar.interceptSearch();
});

// ── When ──────────────────────────────────────────────────────────────────────

When("I search for {string}", (keyword: string) => {
  searchResultsPage.searchBar.search(keyword);
});

When("I clear the search input", () => {
  searchResultsPage.searchBar.clear();
});

// ── Then ──────────────────────────────────────────────────────────────────────

Then("the search input field should be visible", () => {
  overviewPage.searchBar.assertVisible();
});

Then("the search results should be visible", () => {
  searchResultsPage.assertResultsVisible();
});

Then("each result should contain the keyword {string}", (keyword: string) => {
  searchResultsPage.assertAllTilesContain(keyword);
});

Then("no transactions should be visible", () => {
  searchResultsPage.assertNoTransactionsVisible();
});

Then("an empty state message should be displayed", () => {
  searchResultsPage.assertEmptyStateVisible();
});

Then("the search input should be empty", () => {
  searchResultsPage.searchBar.assertEmpty();
});

Then("all API results should contain keyword {string}", (keyword: string) => {
  searchResultsPage.searchBar.assertAllApiResultsContainKeyword(keyword);
});
