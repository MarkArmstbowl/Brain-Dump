# Brain Dump

A small React web app for capturing and organizing thoughts when your mind feels full. Built as an Agile Methods class project.

**Product vision:** To help overwhelmed people clear their mental clutter, regain a sense of control, and focus on what truly matters, one manageable step at a time.

## Current Sprint Goal

Enable users to capture multiple thoughts and manually organize them into **Do**, **Decide**, or **Let Go**, so they can turn a cluttered brain dump into a clearer, manageable view.

## Version 1 features

- **Add a thought:** Write a thought and click **Add Thought**. Empty or whitespace-only entries are rejected.
- **Add multiple thoughts:** Add extra input rows, give each thought its own category, and submit them together.
- **View all current thoughts:** See all thoughts together, grouped by category, with an empty state before the first entry.
- **Edit a thought:** Click **Edit**, change the text, and click **Save**. **Cancel** discards the edit.
- **Delete a thought:** Click **Delete** to remove that thought immediately.
- **Manually categorize thoughts:** Assign each thought to **Do**, **Decide**, or **Let Go**, or leave it **Unsorted**.
- **View thoughts by category:** The **All** view displays separate category groups.
- **Move between categories:** Drag a card into another category in the **All** view, or change its category through **Edit**.
- **Filter the list:** Focus on one category at a time when needed.

Changes are saved using browser `localStorage` and persist after refreshing. Data stays in the current browser and origin; it does not sync between devices. Clearing site data removes saved thoughts. If browser storage is unavailable or full, the app displays a warning that changes could not be saved.

## Run locally

Install the dependencies once:

```sh
npm install
```

Then start the development server:

```sh
npm run dev
```

Open the local URL printed in the terminal. Press `Ctrl+C` to stop the server.

To verify a production build:

```sh
npm run build
```

The application uses React and Vite but still has no backend, external API, API keys, or database. Thoughts remain in browser `localStorage`.

## Sprint Review demo / acceptance check

Use a fresh browser profile or clear this site's local storage before starting. Clearing storage removes existing thoughts.

1. Open the app and verify the empty state.
2. Use **Add another thought** to create several input rows. Assign them to **Do**, **Decide**, **Let Go**, and **Unsorted**, then submit them together.
3. Verify that the **All** view shows every thought in the correct category group.
4. Use each filter and verify that only thoughts in the selected category appear.
5. Drag a thought card into another category and verify that it moves immediately.
6. Edit another thought's text and category, then verify that it appears in its new group.
7. Cancel another edit and verify that its original text and category remain.
8. Delete a thought and verify that only that thought is removed.
9. Refresh and verify that the remaining thoughts and categories persist.

Also check that blank entries cannot be added or saved, Cancel preserves the original text, and deleting the final thought restores the empty state.

## Files and release scope

- `index.html`: Vite entry page.
- `src/App.jsx`: Application state and feature coordination.
- `src/components/`: Forms, filters, list, and thought cards.
- `src/storage/thoughtStorage.js`: Compatible localStorage loading and saving.
- `src/styles.css`: Responsive page and component styles.
- `.gitignore`: Excludes local configuration and generated files.

Pasting a block of text and automatically splitting it into multiple thoughts belongs to a later version. AI, prioritization, next-step recommendations, accounts, history, reflection, reminders, wellness resources, backend APIs, and databases are not part of Version 1.
