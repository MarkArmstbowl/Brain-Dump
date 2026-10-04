# Brain Dump

A React app for capturing thoughts, organizing them, and choosing one manageable next action. Built as an Agile Methods class project.

## Run locally

Use Node.js `20.19+` or `22.12+` and pnpm.

```sh
pnpm install
cp .env.example .env
pnpm dev
```

The core app works without AI configuration. To enable AI, put your private Groq key in `.env` and restart the server:

```dotenv
GROQ_API_KEY=your_actual_key
GROQ_MODEL=openai/gpt-oss-20b
```

The key stays on the server. Never commit `.env`.

```sh
pnpm test
pnpm build
pnpm preview
```

Tests run sequentially with a 30-second per-test timeout to accommodate slower development machines. Provider responses are mocked; passing tests do not establish live Groq availability.

## Capture and organize

- Add, edit, delete, or submit multiple thoughts. Blank input is rejected.
- Paste one thought per line, then review the editable rows. Bullet and numbered prefixes are removed.
- Unfinished capture rows, categories, and unsplit pasted text survive refresh.
- Assign Unsorted, Do, Decide, or Let Go; filter or search active thoughts.
- The All view groups thoughts with category counts. The total counts active thoughts.
- Drag thoughts between groups or reorder with keyboard/touch-friendly up/down controls.
- New thoughts show creation and update timestamps. Older thoughts retain unknown creation dates rather than receiving invented ones.
- Delete and clear-current-dump actions offer Undo. Clearing requires confirmation and preserves inactive items.

## AI and priority

- Request a category suggestion with a short explanation, accept it, override it, or ask again.
- Whole-dump categorization previews all active text before sending it to Groq. Review and optionally change every proposed category before applying the batch.
- Do items support none, low, medium, and high priority. Legacy priority marks load as medium. Reorder by priority explicitly saves a stable descending order within Do.
- Select exactly one active Do item as Next, change it, or choose Not now.
- AI can recommend a priority, recommend Next, or propose a smaller first step. Suggestions require explicit application. Applying a first step replaces the original wording.

Category and planning tools request separate first-use consent. Whole-dump requests preview and confirm the entire list each time, including Decide and Let Go text. Topic detection and summaries run locally.

AI inputs are limited to 1,000 characters per thought and 50 thoughts per comparison or categorization batch. All AI routes share a limit of 12 requests per client per 60 seconds. Requests time out after 15 seconds; edits, lifecycle changes, deletion, and session changes invalidate obsolete suggestions.

## Complete, decide, dismiss, and defer

- Complete any Do card directly, or choose Done for Next. Undo completion or restore from Completed.
- Archive completed items, view them in Archived completed items, or return them to Completed.
- Record a Decide outcome, mark it resolved, view resolved decisions, and reopen them while retaining the outcome.
- Dismiss Let Go thoughts without deleting them; restore them from Dismissed thoughts.
- Save any active thought for later with an optional revisit date; change the date or return it to active.
- Due and overdue reminders appear while the app is open and on reopening. Dismiss a reminder for its date without deleting the saved thought.
- Saved thoughts and reminders remain available across dumps. Returning an older saved thought brings it into the current dump while retaining its original history record.

Reminders use the browser's local calendar date. This browser-only app does not deliver push or email reminders when closed.

## History and review

- In History, start a named new dump. The previous dump is preserved with all active and inactive thoughts.
- Open previous dumps read-only; search thought text, decision outcomes, or dump names. Filter by category, status, and dump start date.
- Review shows a short current-session summary, category distributions, completion events, and completed/resolved thoughts across dumps.
- Recurring topic clues are repeated words across at least two dumps, excluding common words. They are not a semantic AI analysis.
- Frequently deferred thoughts have been saved for later at least twice since tracking began.
- Save a personal reflection for the current dump. It remains available after refresh and in history.
- General wellness links point to NHS Every Mind Matters and WHO's Doing What Matters in Times of Stress.

Historical trends use recorded events and saved outcomes. Actions before tracking began may be unavailable; reopening an archived item is not counted as another completion.

## Storage and deployment

Everything is saved in browser `localStorage`, on the current browser and origin. There are no accounts, database, or device sync. Clearing site data removes thoughts, drafts, history, consent, and reflections.

Existing thoughts migrate into the first workspace dump without changing IDs or order. The authoritative workspace uses `brain-dump-workspace-v3`; the first history save retains the exact prior list in `brain-dump-before-history`. The `brain-dump-thoughts` cache is also maintained for compatibility. Drafts use a separate key. To roll back the history migration, back up the V3 workspace, restore the pre-history list to `brain-dump-thoughts`, and remove the V3 workspace key; changes made after that backup will remain only in the backed-up V3 workspace.

Storage failures show a warning. A new dump cannot start unless history is saved. Corrupt history is left untouched and mutations are blocked until it is recovered, so entering a thought does not silently overwrite history.

Vite middleware provides the AI routes in development and preview. Static hosting alone cannot run those routes; production hosting needs a server/serverless implementation for them.

## Main files

- `src/App.jsx`: application coordination and workspace persistence.
- `src/state/thoughtReducer.js`: thought ordering, priority, and lifecycle transitions.
- `src/state/savedThoughts.js`: cross-dump saved-thought recovery.
- `src/storage/`: thoughts, drafts, consent, and versioned workspace storage.
- `src/domain/`: reminders, history filters, summaries, and insights.
- `src/components/`: capture, board, focus, lifecycle, history, and review UI.
- `src/api/` and `server/`: browser AI calls and server-only Groq handlers.
- `vite.config.js`: middleware registration and test configuration.
