# Brain Dump

A small React web app for capturing and organizing thoughts when your mind feels full. Built as an Agile Methods class project.

**Product vision:** To help overwhelmed people clear their mental clutter, regain a sense of control, and focus on what truly matters, one manageable step at a time.

## Current Increment

The working increment lets users capture and manage thoughts, assign them to **Unsorted**, **Do**, **Decide**, or **Let Go**, and filter the current dump by category.

## Current features

- **Add a thought:** Write a thought and click **Add Thought**. Empty or whitespace-only entries are rejected.
- **View all current thoughts:** See all thoughts together, with an empty state before the first entry.
- **Edit a thought:** Click **Edit**, change the text, and click **Save**. **Cancel** discards the edit.
- **Delete a thought:** Click **Delete** to remove that thought immediately.
- **Organize thoughts:** Assign each thought to **Unsorted**, **Do**, **Decide**, or **Let Go**.
- **Filter the list:** Show all thoughts or focus on one category at a time.

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
2. Add `Finish Agile assignment`.
3. Add `Email professor`.
4. Verify both thoughts are visible.
5. Add one thought to each category and verify the category labels appear.
6. Use the filter buttons and verify only matching thoughts are shown.
7. Edit `Finish Agile assignment` to `Finish Agile feature map`, change its category, and save.
8. Verify the edited text and category appear.
9. Delete `Email professor`.
10. Refresh and verify that the remaining thoughts and categories persist.

Also check that blank entries cannot be added or saved, Cancel preserves the original text, and deleting the final thought restores the empty state.

## Files and release scope

- `index.html`: Vite entry page.
- `src/App.jsx`: Application state and feature coordination.
- `src/components/`: Forms, filters, list, and thought cards.
- `src/storage/thoughtStorage.js`: Compatible localStorage loading and saving.
- `src/styles.css`: Responsive page and component styles.
- `.gitignore`: Excludes local configuration and generated files.

AI, prioritization, next-step recommendations, accounts, history, reflection, reminders, wellness resources, backend APIs, and databases are not part of the current increment.
