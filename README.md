# Brain Dump

A small React web app for capturing and organizing thoughts when your mind feels full. Built as an Agile Methods class project.

**Product vision:** To help overwhelmed people clear their mental clutter, regain a sense of control, and focus on what truly matters, one manageable step at a time.

## Current Sprint Goal

Enable users to move from a crowded brain dump to a focused next action, then complete, resolve, dismiss, or defer thoughts while keeping saved thoughts recoverable.

## Version 1 features

- **Add a thought:** Write a thought and click **Add Thought**. Empty or whitespace-only entries are rejected.
- **Add multiple thoughts:** Add extra input rows, give each thought its own category, and submit them together.
- **View all current thoughts:** See all thoughts together, grouped by category, with an empty state before the first entry.
- **Edit a thought:** Click **Edit**, change the text, and click **Save**. **Cancel** discards the edit.
- **Delete a thought:** Click **Delete** to remove that thought immediately.
- **Manually categorize thoughts:** Assign each thought to **Do**, **Decide**, or **Let Go**.
- **View thoughts by category:** The **All** view displays separate category groups.
- **Move between categories:** Drag a card into another category in the **All** view, or change its category through **Edit**.

## Completed baseline (through V2 item 8)

The previous increment followed the force-ranked Version 2 backlog from top to bottom and stopped after **Override an AI suggestion**.

1. **Paste multiple thoughts at once:** Paste one thought per line, split the text into editable rows, and review before adding.
2. **Reorder thoughts:** Drag cards within a category to change their order. The saved order remains after refresh.
3. **See number of thoughts:** View the total beside the Brain Dump heading.
4. **Leave a thought uncategorized:** Keep any thought in **Unsorted**.
5. **Filter thoughts by category:** Show All, Unsorted, Do, Decide, or Let Go.
6. **Get an AI category suggestion:** Ask Groq to suggest Do, Decide, or Let Go.
7. **Accept an AI suggestion:** Apply the suggested category explicitly.
8. **Override an AI suggestion:** Choose and apply a different category instead.

AI never changes a thought automatically. The current sprint continues in force-ranked order through **Return a saved thought to active**. Features after that cutoff remain outside the sprint.

## Current sprint progress

- **Mark a Do item as priority:** A Do card can be marked with a visible Priority badge.
- **Change the priority:** Remove the priority mark or assign it to another Do card. Moving a priority card out of Do clears its priority because only actionable Do items can be prioritized.
- **Get an AI priority suggestion:** Ask Groq to compare active Do items, review its suggestion, and choose whether to mark it.
- **Select one item as Next:** Mark one Do card as the single current Next item.
- **Change the selected Next item:** Select another Do card and the previous Next mark is cleared.
- **Get an AI-recommended Next item:** Ask Groq to recommend one active Do item, then explicitly apply or dismiss it.
- **Break a large item into a smaller first step:** Ask Groq for a smaller version of one Do item, review the proposed wording, then explicitly replace or dismiss it.

Priority remains a simple yes/no marker in this increment. Multiple priority levels and priority-based reordering remain separate backlog items. AI suggestions never change a thought, priority, or Next selection until the user applies them.

### Engineering work completed this sprint

- **Keyboard and touch reordering:** Every card in the grouped All view has focused up/down controls in addition to drag-and-drop. Order remains saved after refresh.
- **Central thought reducer:** Add, edit, delete, move, category, priority, Next, and first-step transitions use one tested reducer.
- **Smaller thought-card components:** Editing, category AI, focus tools, ordering, and standard actions are separate components with the same visible behavior.
- **Clearer Organize workspace:** Card tools and AI focus suggestions use collapsed action drawers, while **Focus Do** widens the Do column and **Balance columns** restores the four-column view.

Changes are saved using browser `localStorage` and persist after refreshing. Data stays in the current browser and origin; it does not sync between devices. Clearing site data removes saved thoughts. If browser storage is unavailable or full, the app displays a warning that changes could not be saved.

## Run locally

Use Node.js `20.19+` or `22.12+` and npm.

Install the dependencies once:

```sh
npm install
```

Create your private environment file:

```sh
cp .env.example .env
```

Open `.env` and put your Groq key after the equals sign:

```dotenv
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

Create a key on the [Groq API Keys page](https://console.groq.com/keys). Never commit or share the `.env` file. The supplied `.gitignore` excludes it, while `.env.example` documents the variable names for teammates.

Restart the development server after changing `.env` so the new values are loaded.

Then start the development server:

```sh
npm run dev
```

Open the local URL printed in the terminal. Press `Ctrl+C` to stop the server.

To verify a production build:

```sh
npm run build
```

Run the automated V1 and V2 regression checks:

```sh
npm test
```

The application uses React and Vite. Vite server middleware sends the consented category or focus request to Groq, so the secret key never enters the browser bundle. No database is required: thoughts, priority marks, and the selected Next item remain in browser `localStorage`. Each teammate uses their own `.env` file and Groq key.

Before the first category request, the app shows the exact selected thought that will be sent, identifies Groq as the external provider, links to Groq's privacy policy, and allows the user to cancel. Focus tools use a separate consent because priority and Next recommendations send all active Do thought text for comparison; the dialog previews that exact list. A first-step request sends only its selected Do thought. Unsorted, Decide, and Let Go thoughts are not included in focus requests. Consent choices are remembered only in that browser.

All local AI routes share a limit of **12 requests per client per 60 seconds**; additional requests receive HTTP 429 with a retry time. Restarting the local Vite server resets this in-memory limit.

AI requests time out after 15 seconds. If a thought is edited, deleted, or assigned before its response arrives, the obsolete request is canceled so it cannot update the current card.

## Sprint Review demo / acceptance check

Use a fresh browser profile or clear this site's local storage before starting. Clearing storage removes existing thoughts.

1. Open the app and verify **Capture** is selected with a count of 0. Open **Organize** and verify its empty state, then return to **Capture**.
2. In the **Capture** tab, click **Paste multiple thoughts**, paste at least three lines, and click **Split into thoughts**. Verify each line becomes an editable input row, then add them together.
3. Use **Add another thought** to confirm manual multi-entry still works.
4. Open **Organize** using its tab or **Organize thoughts**. Verify **All** groups the thoughts and the total count is correct. Check every category filter.
5. Drag two cards within one category and verify their order changes. Use a card's up/down buttons with a mouse, touch, and keyboard Enter or Space; verify focus stays on the control and the order persists. Drag a card into another category and verify it moves.
6. Click **Focus Do** and verify the Do column expands; click **Balance columns** to restore four equal columns. Open a Do card's **Actions**, click **Mark priority**, and verify its Priority badge appears. Refresh to verify the mark persists, then remove it or move the card out of Do and verify the badge clears.
7. In each Do card's **Actions**, click **Make Next** on one card, then another. Verify only the second card keeps the Next badge and the focus panel names it.
8. Expand **AI focus suggestions** and click **Suggest a priority**. On first use, verify the consent dialog lists only active Do thoughts. Confirm, review the suggestion, and click **Mark as priority**.
9. Click **Recommend my Next item**, review the suggestion, and click **Make this Next**. Verify it replaces the prior Next selection.
10. Open a large Do card's **Actions** and click **Break into first step**. Verify the original remains unchanged until **Use this first step** is clicked.
11. Open a card's **Actions** and click **Suggest category**. Verify the AI suggestion appears but the card does not move yet.
12. Click **Accept suggestion** and verify the card moves to that category.
13. Request another category suggestion, click **Choose another**, select a different category, and click **Use my choice**. Verify the override is used.
14. Use the **Edit** and **Delete** controls inside **Actions** to edit, cancel an edit, and delete thoughts, confirming the Version 1 behavior still works.
15. Refresh and verify that the remaining thoughts, categories, priority and Next marks, and order persist.

Also check that blank entries cannot be added or saved, Cancel preserves the original text, and deleting the final thought restores the empty state.

## Files and release scope

- `index.html`: Vite entry page.
- `src/App.jsx`: Application state and feature coordination.
- `src/components/`: Forms, filters, list, and thought cards.
- `src/state/thoughtReducer.js`: Tested state transitions for every active-thought mutation.
- `src/api/categorySuggestion.js`: Browser call to the same-origin AI route.
- `src/api/focusSuggestions.js`: Browser calls for priority, Next, and smaller-step suggestions.
- `server/categorySuggestion.js`: Server-only Groq request, classification prompt, validation, and safe errors.
- `server/focusSuggestion.js`: Server-only focus prompts, request validation, and structured AI response mapping.
- `src/storage/thoughtStorage.js`: Compatible localStorage loading and saving.
- `src/styles.css`: Responsive page and component styles.
- `.env.example`: Safe template for the required local Groq configuration.
- `.gitignore`: Excludes local configuration and generated files.
- `TECHNICAL_DEBT.md`: AI-assisted code review, repair-cost estimate, and proposed force-ranked debt cards.

The current sprint stops after **Return a saved thought to active**. Undoing completion, viewing completed items, reopening decisions, restoring dismissed thoughts, automatic whole-dump categorization, history, reflection, reminders, wellness resources, accounts, and databases remain outside this sprint.
