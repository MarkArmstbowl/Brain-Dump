# Brain Dump

A small web app for capturing thoughts when your mind feels full. Built for an Agile Methods class using HTML, CSS, and vanilla JavaScript.

**Product vision:** To help overwhelmed people clear their mental clutter, regain a sense of control, and focus on what truly matters, one manageable step at a time.

## Current Sprint Goal

Enable users to quickly capture and manage the thoughts currently on their mind.

## Sprint 1 features

- **Add a thought:** Write a thought and click **Add Thought**. Empty or whitespace-only entries are rejected.
- **View all current thoughts:** See all thoughts together, with an empty state before the first entry.
- **Edit a thought:** Click **Edit**, change the text, and click **Save**. **Cancel** discards the edit.
- **Delete a thought:** Click **Delete** to remove that thought immediately.

Changes are saved using browser `localStorage` and persist after refreshing. Data stays in the current browser and origin; it does not sync between devices. Clearing site data removes saved thoughts. If browser storage is unavailable or full, the app displays a warning that changes could not be saved.

## Run locally

From this project's folder, run:

```sh
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000) in a modern browser. Press `Ctrl+C` in the terminal to stop the server.

Python serves the static files only; the application has no backend. No package installation, build step, API keys, or `.env` file is needed.

## Sprint Review demo / acceptance check

Use a fresh browser profile or clear this site's local storage before starting. Clearing storage removes existing thoughts.

1. Open the app and verify the empty state.
2. Add `Finish Agile assignment`.
3. Add `Email professor`.
4. Verify both thoughts are visible.
5. Edit `Finish Agile assignment` to `Finish Agile feature map` and save.
6. Verify the edited text appears.
7. Delete `Email professor`.
8. Verify only `Finish Agile feature map` remains.
9. Refresh and verify that the remaining thought persists.

Also check that blank entries cannot be added or saved, Cancel preserves the original text, and deleting the final thought restores the empty state.

## Files and release scope

- `index.html`: Page structure and input form.
- `styles.css`: Responsive page and card styles.
- `app.js`: Add, view, edit, delete, and browser storage.
- `.gitignore`: Excludes local configuration and generated files.

This first increment implements only Sprint 1. Do / Decide / Let Go categories, AI, prioritization, next-step recommendations, accounts, history, reflection, reminders, wellness resources, backend APIs, and databases are outside this sprint and are not implemented.
