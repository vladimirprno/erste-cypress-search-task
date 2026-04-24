# Test Approach — Transactions Search Functionality

## 1. What scenarios would I cover with automation

The starting point is always the user value. I focus first on critical happy path and unhappy path scenarios — the flows that users rely on most and that, if broken, cause immediate visible harm.

For the transaction search feature this means:

- **Happy path** — a valid keyword returns matching results and the results are correct
- **Empty state** — a keyword with no matches shows a clear empty state message, not a broken UI
- **Case insensitivity** — the search is not case-sensitive, as a user would never think about casing when searching their own transactions
- **Refining search** — typing a new keyword from the results page correctly updates the results; this is a distinct code path from the first search
- **Clearing input** — the clear button resets the field correctly

A second consideration is **stability**. Automated tests against fast-changing UI areas become a maintenance burden that costs more than the safety they provide. I start automating once a feature is stable enough that selectors and flows won't change every sprint.

Once the feature is stable, the next layer can be **visual regression testing** on the key stable elements (for example using Percy) — catching layout and style regressions that functional assertions miss.

Finally, when compliance or regulation requires it, **automated accessibility testing** (axe, Cypress accessibility checks) can be added to verify WCAG conformance on the search flow.

In this suite the scenarios are tagged to reflect their importance:

- `@smoke` — single fast check that the core feature is alive; runs on every push and pull request
- `@regression` — full suite including edge cases; runs on merge to main, nightly, and on demand
- `@api` — API contract assertion; can be run in isolation to verify backend behaviour

---

## 2. What assertions would I use

I use two layers of assertions: **UI (DOM)** and **API (network response)**.

### UI assertions

These verify what the user actually sees:

| Assertion | What it checks |
|---|---|
| Results list is visible and non-empty | The search returned results and rendered them |
| Every tile's text contains the search keyword | Not just the first result — all of them match |
| Empty state element is visible | The app communicates no results clearly |
| No transaction items exist | No stale tiles remain from a previous search |
| Search input is visible | The component rendered correctly |
| Input value is empty after clearing | The clear action worked |
| URL includes `/search` after navigation | The routing worked correctly |

### API assertions

These verify the contract between the frontend and the backend, independent of how the UI renders:

| Assertion | What it checks |
|---|---|
| HTTP status 200 | The search request succeeded |
| Every transaction contains the keyword in at least one searchable field | The backend is not returning irrelevant results |

The searchable fields checked are: `title`, `id`, `subtitle`, `reference`, `sender/receiver/partner IBAN`, and `categories[].subCategory` — the fields the API actually searches across.

---

## 3. How would I structure the test files

The structure follows a **Page Object Model** (POM) with a **Component Object Model** (COM) layer for shared UI elements.

```
cypress/
├── e2e/
│   └── transactions/
│       └── search.feature        # Gherkin scenarios — readable by non-engineers
├── fixtures/
│   └── users.json                # Test data kept separate from test logic
├── pages/
│   ├── components/
│   │   └── SearchBar.ts          # Shared component — same search bar on two pages
│   ├── LoginPage.ts              # Cross-origin login logic
│   ├── OverviewPage.ts           # Overview page
│   └── SearchResultsPage.ts      # Results page — DOM assertions only
├── step_definitions/
│   └── search.steps.ts           # Thin Gherkin bindings — no logic, just delegation
└── utils/
    ├── commands.ts               # Custom commands: cy.login(), cy.getByTestId()
    └── e2e.ts                    # Support file entry point
```

**Key decisions:**

- **Gherkin feature files** live in `e2e/` organised by feature area. Each step delegates entirely to a page object — no assertions or selectors in step definitions.

- **Page objects** encapsulate all selectors and interactions for a page.

- **`SearchBar` as a component** — the search bar appears on both the overview page and the results page. Rather than duplicating selectors or using inheritance, it is a separate class composed into both pages. It also owns the network intercept logic since the intercept alias is tied to the search action.

- **Custom commands** (`cy.login`, `cy.getByTestId`) extend Cypress globally for operations used across the whole suite. Login uses `cy.session()` to cache the authenticated state across tests — login runs once per suite, not once per test.

- **Test data in fixtures** — credentials and other data live in `fixtures/users.json`, not hardcoded in tests. This makes environment switching straightforward.

---

## Manual Testing Approach

### Preparation

Before starting, I read any available documentation, analysis, or design specs (Figma). If these are not available I talk to analysts and developers to understand the intended behaviour and edge cases. If none of that is available I start from scratch by testing it as a user would, using common sense.

Based on the analysis I prepare test cases and identify the test data needed — in this case, subjects with accounts that have transactions with known keywords. I use existing test subjects or create new ones if needed.

The testing environment should have all related changes merged and be in a stable state before testing begins. If the feature is already live and telemetry is enabled, usage data can reveal the most common user flows and help prioritise what to test first.

### Testing types

**API / Integration testing**
Verify the API works correctly in isolation: does it return HTTP 200? Do the filters (`q=Fashion`) apply correctly? Is the response structure and format correct?

**Design testing**
Compare the rendered UI against the Figma designs: correct layout, typography, spacing, icons, and empty/loading states.

**End-to-end testing**
Test the full integrated flow: frontend calls the correct API, results are rendered correctly, user interactions (refine, clear) behave as expected.

**Performance testing**
On the API level: response time under normal and high load. On the E2E level: time from search submission to results visible.

**Accessibility testing**
If required: keyboard navigation through the search flow, screen reader labels, sufficient colour contrast, focus management after search.

**Exploratory testing**
Unscripted sessions to find unexpected behaviour. Focus on unusual input, interactions and flows that are not covered by scripted test cases.

### Test cases

**Functional — happy path**
- Keyword search (`Fashion`) — results appear and match
- Search by partial keyword
- Search by transaction amount
- Search by date range
- Search by filters
- Combination of above
- Case-insensitive search (`fashion`, `FASHION`, `fAsHiOn`)

**Functional — unhappy path / edge cases**
- Keyword with no matches — empty state shown, no crash
- Refine search from results page — results update correctly
- Clear input — field empties, state resets
- Special characters — `@`, `#`, `%`, `<script>` — no crash, graceful result
- Whitespace-only input — treated as empty or no results, no error
- Very long input (500+ characters) — input does not overflow, no crash
- Back button after search — app state is consistent with what is expected

**Exploratory**
- Switch language mid-search
- Multiple tabs — session consistency
- Network throttling / offline search
- Direct URL navigation to `/search?q=Fashion`
