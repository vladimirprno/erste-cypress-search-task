@search
Feature: Transaction Search
  As a George banking user
  I want to search my transaction history by keyword
  So that I can quickly find specific transactions

  Background:
    Given I am logged in as a standard user
    And I am on the overview page

  @smoke @regression
  Scenario: Search with a valid keyword returns matching transactions
    When I search for "Fashion"
    Then the search results should be visible
    And each result should contain the keyword "Fashion"

  @regression @api
  Scenario: Search API returns only transactions relevant to the search keyword
    Given the search API is being monitored
    When I search for "Fashion"
    Then all API results should contain keyword "Fashion"

  @regression
  Scenario: Searching with a keyword that has no matches shows an empty state
    When I search for "XXXemptystateXXX"
    Then no transactions should be visible
    And an empty state message should be displayed

  @regression
  Scenario: Search is case-insensitive
    When I search for "FASHION"
    Then the search results should be visible
    And each result should contain the keyword "fashion"

  @regression
  Scenario: Refining search from the results page updates the results
    When I search for "Fashion"
    Then the search results should be visible
    When I search for "XXXemptystateXXX"
    Then no transactions should be visible

  @regression
  Scenario: Clearing the search input on the results page resets the field
    When I search for "Fashion"
    Then the search results should be visible
    When I clear the search input
    Then the search input should be empty


