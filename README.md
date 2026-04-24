# George Banking — Transaction Search Test Suite

![Cypress](https://img.shields.io/badge/Cypress-15-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)
![Cucumber](https://img.shields.io/badge/Cucumber-Gherkin-success)

End-to-end test suite for the transaction search feature of the [George](https://george.fat3.sparkasse.at) banking platform. Written in TypeScript using Cypress 15, BDD-style Gherkin scenarios and a Page Object Model layered with a Component Object Model for shared UI elements.

> For the full test approach — scenario selection rationale, assertion strategy, file structure decisions, and manual testing approach — see [APPROACH.md](APPROACH.md).

---

## Tech Stack

| Tool | Version |
|---|---|
| Cypress | 15 |
| TypeScript | 6 |
| @badeball/cypress-cucumber-preprocessor | 24 |
| @bahmutov/cypress-esbuild-preprocessor | 2 |
| Node.js | 18+ |

---

## Project Structure

```
cypress/
├── e2e/
│   └── transactions/
│       └── search.feature        # Gherkin scenarios
├── fixtures/
│   └── users.json                # Test credentials
├── pages/
│   ├── components/
│   │   └── SearchBar.ts          # Shared component (overview + results page)
│   ├── LoginPage.ts              # Cross-origin login via cy.origin()
│   ├── OverviewPage.ts           # Overview page with search bar
│   └── SearchResultsPage.ts     # Results page DOM assertions
├── step_definitions/
│   └── search.steps.ts           # Thin Gherkin step bindings
└── utils/
    ├── commands.ts               # cy.login(), cy.getByTestId() custom commands
    └── e2e.ts                    # Support file entry point
cypress.config.ts
tsconfig.json
```

---

## Setup

**Prerequisites:** Node.js 18+

```bash
npm install
```

---

## Running Tests

| Command | Description |
|---|---|
| `npm run cy:open` | Open Cypress UI |
| `npm run cy:run` | Run all specs headlessly |
| `npm run cy:run:search` | Run only the search feature |

**Run by tag:**

```bash
# Smoke tests only
npx cypress run --env tags=@smoke

# Regression suite
npx cypress run --env tags=@regression

# API assertions only
npx cypress run --env tags=@api
```

---

## Test Scenarios

| Tag | Scenario | What it asserts |
|---|---|---|
| `@smoke` `@regression` | Search with a valid keyword returns matching transactions | Results list is visible; every tile text contains the keyword |
| `@regression` `@api` | Search API returns only transactions relevant to the search keyword | HTTP 200; every transaction in the response contains the keyword in at least one searchable field (title, id, subtitle, reference, IBAN, subCategory) |
| `@regression` | Searching with a keyword that has no matches shows an empty state | No transaction items exist; empty-state element is visible |
| `@regression` | Search is case-insensitive | Uppercase keyword returns results; tile text matches case-insensitively |
| `@regression` | Refining search from the results page updates the results | Second search from the results page replaces results correctly |
| `@regression` | Clearing the search input on the results page resets the field | Input value is empty after clearing |

**Tag strategy:**

| Tag | When it runs | Purpose |
|---|---|---|
| `@smoke` | Every push and PR | Single fast UI health check — did the core feature break? |
| `@regression` | Every push and PR (after smoke) | Full suite — all 6 scenarios including the smoke one |
| `@api` | Part of regression | API contract assertion — isolated if you need a network-only run |

---

## CI/CD

The pipeline is defined in [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml) and runs on every push and pull request to `main`.

**Jobs:**

```
pull_request        push to main        schedule (nightly)    workflow_dispatch
      │                   │                     │                     │
      ▼                   ▼                     ▼                     ▼
    smoke              smoke                 smoke                 smoke
  (skips regression)     │                     │                     │
                         ▼                     ▼                     ▼
                     regression            regression            regression
```

- **Smoke** runs on every trigger — fast PR gate, single test
- **Regression** is skipped on pull requests; runs on push to main, nightly at 02:00 UTC, and on-demand via the GitHub UI (`workflow_dispatch`)
- Regression is gated on smoke passing (`needs: smoke`) to avoid burning CI minutes on a broken build
- `cypress-io/github-action@v6` handles `npm ci`, dependency caching, and Cypress binary caching automatically
- Screenshots are uploaded as artifacts (7-day retention) on failure, matching `screenshotOnRunFailure: true` in `cypress.config.ts`

---
