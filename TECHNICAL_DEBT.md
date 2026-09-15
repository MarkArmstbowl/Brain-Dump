# Brain Dump Technical Debt Assessment

Assessed after completing the current sprint increment through Version 2 item 8. These are proposed **Product Backlog** cards for the Product Owner to force-rank. They describe unfinished work and should not be placed in Done.

## How the assessment was produced

The AI review prompt was:

> Inspect every source file. Identify each major code segment that reflects spaghetti code, inefficient loops, inefficient nested conditionals, SOLID or clean-code violations, missing tests, and security weaknesses. Do not invent findings. Estimate the manual repair effort and cost of the three most significant code-quality offenses. Identify separate backlog items for security hardening, including injection and common web attack risks, and give each item testable acceptance criteria.

The review then checked the findings against the actual React, Vite middleware, localStorage, and Groq request paths. There is no SQL query or database layer, so SQL injection does not currently apply. React renders thought text as escaped text, which reduces direct stored-XSS exposure.

Existing protections were excluded from the debt cards: the Groq key is server-side and Git-ignored; the endpoint accepts only POST, caps request size, validates input and AI output, returns generic upstream errors, and does not store AI responses on a server.

## Code findings

| Area | Finding | Current impact |
| --- | --- | --- |
| `src/components/ThoughtCard.jsx` | The component handles display, editing, AI request presentation, accept/override controls, validation, and drag/drop events. This violates single responsibility and will make later priority and Next features risky to add. | Medium now; high as V2 grows. |
| `src/App.jsx` | Thought mutations, filtering, persistence, announcements, and transient AI request state are coordinated in one component with parallel state objects. | Medium; related updates can drift apart. |
| `src/components/ThoughtList.jsx` | Rendering and native drag/drop coordination are coupled. Reordering relies on the position of items in one shared array and has no permanent automated regression test. | Medium; reorder bugs are easy to reintroduce. |
| `src/components/ThoughtComposer.jsx` | Paste parsing is embedded in the UI component and has no batch-size or total-character limit. | Low at classroom scale; large pastes could slow rendering or fill localStorage. |
| `server/categorySuggestion.js` | HTTP parsing, validation, prompt construction, provider calling, and response mapping share one handler. | Low now; harder to swap providers or test failure paths later. |
| Group rendering and reorder mutations | Category grouping performs four linear filters and a move performs several linear array scans. | Low. This is O(n) with small constants and is not an offensive loop for the expected demo data. |

No spaghetti control flow or deeply nested if/then chain was found. The main debt comes from growing component responsibilities, transient-state coordination, and the absence of checked-in tests.

## Manual repair cost for the top three code-quality offenses

Estimate assumes one engineer working manually at **$75/hour**, including focused regression testing but excluding team meetings.

| Rank | Repair | Effort | Estimated labor cost |
| --- | --- | ---: | ---: |
| 1 | Split `ThoughtCard` into focused view, edit, and AI-suggestion components while preserving behavior. | 6–10 hours | $450–$750 |
| 2 | Move thought operations and AI request state from `App` into a reducer or focused hooks, with tests for each transition. | 5–8 hours | $375–$600 |
| 3 | Add durable browser tests for paste, reorder, cross-category moves, AI accept/override, errors, and persistence. | 8–14 hours | $600–$1,050 |
|  | **Total** | **19–32 hours** | **$1,425–$2,400** |

## Proposed force-ranked Product Backlog cards

### 1. SEC: Rate-limit the AI suggestion endpoint

**Risk:** A user or script with access to the running app can repeatedly call the endpoint and consume the team's Groq quota.

**Acceptance criteria:** Enforce a per-client request limit, return HTTP 429 when exceeded, document the limit, and verify normal classroom use still works.

### 2. SEC: Add explicit consent and privacy details before sending a thought to Groq

**Risk:** The page gives a short disclosure, but it does not provide first-use consent or explain the external provider and retention considerations.

**Acceptance criteria:** Before the first AI request, explain what text is sent and to whom; allow cancel; remember the choice locally; link to the relevant privacy information.

### 3. TD: Check in automated tests for the completed increment

**Risk:** Paste parsing, array ordering, AI states, and localStorage compatibility can regress without being noticed before Sprint Review.

**Acceptance criteria:** Automated tests cover V1 plus V2 items 1–8, including provider errors and refresh persistence, and run with one documented command.

### 4. SEC: Cancel slow and stale AI requests

**Risk:** The current fetch has no timeout. A response can arrive after a thought is edited or deleted and leave stale transient state.

**Acceptance criteria:** Apply a timeout with `AbortController`, cancel requests when the related thought changes or disappears, and show a retryable message.

### 5. TD: Support reorder without a mouse

**Risk:** Native HTML drag/drop is unreliable on touch devices and cannot be completed from the keyboard. Edit provides a category-move fallback but cannot reorder items.

**Acceptance criteria:** Users can move a thought up or down with touch and keyboard controls; focus remains predictable; the new order persists after refresh.

### 6. TD: Extract thought state transitions from `App`

**Risk:** Adding priority and Next features to the current centralized component will increase coupled state updates.

**Acceptance criteria:** Add, edit, delete, reorder, move, accept, and override use one tested reducer or focused state hook without changing visible behavior.

### 7. TD: Split the Thought Card component by responsibility

**Risk:** One component owns several independent workflows and will become difficult to review as more actions are added.

**Acceptance criteria:** Separate display/actions, edit form, and AI suggestion UI into focused components with clear props and unchanged Sprint Review behavior.

### 8. SEC: Add production HTTP security controls

**Risk:** Vite is sufficient for a local demo, but a deployed service still needs origin checks, HTTPS, security headers, and a deliberate API exposure policy.

**Acceptance criteria:** Document the supported deployment, require HTTPS, restrict allowed origins, and set CSP, frame, content-type, and referrer protections.

### 9. TD: Limit pasted batch size and stored thought size

**Risk:** An extremely large paste can create excessive DOM nodes or exceed browser storage.

**Acceptance criteria:** Define and enforce per-thought and per-batch limits before creating rows; provide a clear message without losing the pasted text.

### 10. TD: Separate the AI route from Vite for deployable environments

**Risk:** The server middleware works in Vite dev and preview, but static hosting alone cannot run it.

**Acceptance criteria:** Provide a documented deployable server or serverless route, keep secrets out of the client bundle, and preserve the same frontend API contract.
