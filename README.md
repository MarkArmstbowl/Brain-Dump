# Brain Dump

A small React web app for capturing and organizing thoughts when your mind feels full. Built as an Agile Methods class project.

**Product vision:** To help overwhelmed people clear their mental clutter, regain a sense of control, and focus on what truly matters, one manageable step at a time.

## Current Sprint Goal

Enable users to organize a larger brain dump faster by pasting and reordering multiple thoughts and using AI category suggestions they can accept or override.

## Version 1 features

- **Add a thought:** Write a thought and click **Add Thought**. Empty or whitespace-only entries are rejected.
- **Add multiple thoughts:** Add extra input rows, give each thought its own category, and submit them together.
- **View all current thoughts:** See all thoughts together, grouped by category, with an empty state before the first entry.
- **Edit a thought:** Click **Edit**, change the text, and click **Save**. **Cancel** discards the edit.
- **Delete a thought:** Click **Delete** to remove that thought immediately.
- **Manually categorize thoughts:** Assign each thought to **Do**, **Decide**, or **Let Go**.
- **View thoughts by category:** The **All** view displays separate category groups.
- **Move between categories:** Drag a card into another category in the **All** view, or change its category through **Edit**.

## Current sprint increment (through V2 item 8)

The sprint follows the force-ranked Version 2 backlog from top to bottom. It stops after **Override an AI suggestion**.

1. **Paste multiple thoughts at once:** Paste one thought per line, split the text into editable rows, and review before adding.
2. **Reorder thoughts:** Drag cards within a category to change their order. The saved order remains after refresh.
3. **See number of thoughts:** View the total beside the Brain Dump heading.
4. **Leave a thought uncategorized:** Keep any thought in **Unsorted**.
5. **Filter thoughts by category:** Show All, Unsorted, Do, Decide, or Let Go.
6. **Get an AI category suggestion:** Ask Groq to suggest Do, Decide, or Let Go.
7. **Accept an AI suggestion:** Apply the suggested category explicitly.
8. **Override an AI suggestion:** Choose and apply a different category instead.

AI never changes a thought automatically. Priority and next-step features begin at item 9 and are outside this sprint.

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

The application uses React and Vite. A small Vite server middleware sends only the thought for which the user clicks **Suggest category** to Groq, so the secret key never enters the browser bundle. No database is required: thoughts and their order remain in browser `localStorage`. Each teammate uses their own `.env` file and Groq key.

## Sprint Review demo / acceptance check

Use a fresh browser profile or clear this site's local storage before starting. Clearing storage removes existing thoughts.

1. Open the app and verify **Capture** is selected with a count of 0. Open **Organize** and verify its empty state, then return to **Capture**.
2. In the **Capture** tab, click **Paste multiple thoughts**, paste at least three lines, and click **Split into thoughts**. Verify each line becomes an editable input row, then add them together.
3. Use **Add another thought** to confirm manual multi-entry still works.
4. Open **Organize** using its tab or **Organize thoughts**. Verify **All** groups the thoughts and the total count is correct. Check every category filter.
5. Drag two cards within one category and verify their order changes. Drag a card into another category and verify it moves.
6. Click **Suggest category**. Verify the AI suggestion appears but the card does not move yet.
7. Click **Accept suggestion** and verify the card moves to that category.
8. Request another suggestion, click **Choose another**, select a different category, and click **Use my choice**. Verify the override is used.
9. Edit, cancel an edit, and delete thoughts to confirm the Version 1 behavior still works.
10. Refresh and verify that the remaining thoughts, categories, and order persist.

Also check that blank entries cannot be added or saved, Cancel preserves the original text, and deleting the final thought restores the empty state.

## Files and release scope

- `index.html`: Vite entry page.
- `src/App.jsx`: Application state and feature coordination.
- `src/components/`: Forms, filters, list, and thought cards.
- `src/api/categorySuggestion.js`: Browser call to the same-origin AI route.
- `server/categorySuggestion.js`: Server-only Groq request, classification prompt, validation, and safe errors.
- `src/storage/thoughtStorage.js`: Compatible localStorage loading and saving.
- `src/styles.css`: Responsive page and component styles.
- `.env.example`: Safe template for the required local Groq configuration.
- `.gitignore`: Excludes local configuration and generated files.
- `TECHNICAL_DEBT.md`: AI-assisted code review, repair-cost estimate, and proposed force-ranked debt cards.

Prioritization, next-step recommendations, accounts, history, reflection, reminders, wellness resources, and databases are not part of this sprint.
