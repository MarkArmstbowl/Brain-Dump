import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App";

beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const seed = (thoughts) => localStorage.setItem("brain-dump-thoughts", JSON.stringify(thoughts));
const open = () => fireEvent.click(screen.getByRole("tab", { name: /Organize/i }));

it("restores unfinished capture rows and pasted input after remount", () => {
  const view = render(<App />);
  fireEvent.change(screen.getByLabelText("Thought 1"), { target: { value: "Unfinished" } });
  fireEvent.click(screen.getByRole("button", { name: "Paste multiple thoughts" }));
  fireEvent.change(screen.getByLabelText("Paste your list"), { target: { value: "Another\nLater" } });
  view.unmount();
  render(<App />);
  expect(screen.getByLabelText("Thought 1")).toHaveValue("Unfinished");
  expect(screen.getByLabelText("Paste your list")).toHaveValue("Another\nLater");
});

it("searches active text, undoes deletion in original order, and confirms/undoes clearing", async () => {
  seed([{ id: "a", text: "Alpha", category: "do" }, { id: "b", text: "Beta", category: "decide" },
    { id: "c", text: "Finished", category: "do", status: "completed" }]);
  render(<App />); open();
  fireEvent.change(screen.getByLabelText("Search current thoughts"), { target: { value: "ALPHA" } });
  expect(screen.getByText("Alpha", { selector: ".thought-text" })).toBeVisible();
  expect(screen.queryByText("Beta", { selector: ".thought-text" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Search current thoughts"), { target: { value: "" } });
  const card = screen.getByText("Alpha", { selector: ".thought-text" }).closest("li");
  card.querySelector("details").open = true;
  fireEvent.click(within(card).getByRole("button", { name: "Delete" }));
  fireEvent.click(await screen.findByRole("button", { name: "Undo" }));
  expect(JSON.parse(localStorage.getItem("brain-dump-thoughts")).map(({ id }) => id)).toEqual(["a", "b", "c"]);
  fireEvent.click(screen.getByRole("button", { name: "Clear current dump" }));
  expect(screen.getByRole("dialog")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Clear thoughts" }));
  expect(JSON.parse(localStorage.getItem("brain-dump-thoughts")).map(({ id }) => id)).toEqual(["c"]);
  fireEvent.click(await screen.findByRole("button", { name: "Undo" }));
  expect(JSON.parse(localStorage.getItem("brain-dump-thoughts")).map(({ id }) => id)).toEqual(["a", "b", "c"]);
});

it("records/resolves/reopens decisions, dismisses/restores thoughts and archives direct completion", async () => {
  seed([{ id: "d", text: "Choose a course", category: "decide" },
    { id: "l", text: "Old worry", category: "let-go" }, { id: "t", text: "Send email", category: "do" }]);
  render(<App />); open();
  function actionsFor(text) {
    const card = screen.getByText(text, { selector: ".thought-text" }).closest("li");
    card.querySelector("details").open = true;
    return within(card);
  }
  actionsFor("Choose a course");
  fireEvent.change(screen.getByLabelText("What did you decide?"), { target: { value: "Take art" } });
  fireEvent.click(screen.getByRole("button", { name: "Record decision" }));
  fireEvent.click(actionsFor("Choose a course").getByRole("button", { name: "Mark resolved" }));
  expect(screen.queryByText("Choose a course", { selector: ".thought-text" })).toBeNull();
  fireEvent.click(screen.getByText("Resolved decisions (1)", { selector: "summary" }));
  expect(within(screen.getByText("Resolved decisions (1)", { selector: "summary" }).closest("details")).getByText("Decision: Take art")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Reopen decision" }));
  expect(screen.getByText("Choose a course", { selector: ".thought-text" })).toBeVisible();
  fireEvent.click(actionsFor("Old worry").getByRole("button", { name: "Dismiss thought" }));
  fireEvent.click(screen.getByText("Dismissed thoughts (1)", { selector: "summary" }));
  fireEvent.click(screen.getByRole("button", { name: "Restore dismissed thought" }));
  expect(screen.getByText("Old worry", { selector: ".thought-text" })).toBeVisible();
  fireEvent.click(actionsFor("Send email").getByRole("button", { name: "Mark complete" }));
  fireEvent.click(screen.getByText("Completed", { selector: "summary > span" }));
  fireEvent.click(screen.getByRole("button", { name: "Archive" }));
  expect(screen.getByText("Archived completed items (1)", { selector: "summary" })).toBeVisible();
});

it("saves a thought with a revisit date, restores it after reload and acknowledges overdue reminders", async () => {
  seed([{ id: "s", text: "Plan a trip", category: "do" }]);
  const view = render(<App />); open();
  const card = screen.getByText("Plan a trip", { selector: ".thought-text" }).closest("li");
  card.querySelector("details").open = true;
  fireEvent.click(within(card).getByRole("button", { name: "Set revisit date" }));
  fireEvent.change(screen.getByLabelText("Revisit date"), { target: { value: "2020-01-01" } });
  fireEvent.click(screen.getByRole("button", { name: "Save thought for later" }));
  expect(screen.queryByText("Plan a trip", { selector: ".thought-text" })).toBeNull();
  expect(screen.getByText(/Revisit reminder: Plan a trip/)).toBeVisible();
  view.unmount();
  render(<App />); open();
  expect(screen.getByText(/Revisit reminder: Plan a trip/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Dismiss reminder" }));
  expect(screen.queryByText(/Revisit reminder: Plan a trip/)).toBeNull();
  fireEvent.click(screen.getByText("Saved for later", { selector: "summary > span" }));
  expect(screen.getByLabelText("Revisit date for Plan a trip")).toHaveValue("2020-01-01");
  fireEvent.click(screen.getByRole("button", { name: "Return to active" }));
  expect(screen.getByText("Plan a trip", { selector: ".thought-text" })).toBeVisible();
});

it("starts a separate dump and opens/searches the previous dump after reload", () => {
  seed([{ id: "h", text: "Email professor", category: "do" }, { id: "other", text: "Pick a course", category: "decide" }]);
  const view = render(<App />);
  fireEvent.click(screen.getByRole("tab", { name: "History" }));
  fireEvent.change(screen.getByLabelText("New dump name"), { target: { value: "Fresh start" } });
  fireEvent.click(screen.getByRole("button", { name: "Start new dump" }));
  expect(screen.getByText("Current dump: Fresh start")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Open dump Imported dump" }));
  expect(within(screen.getByLabelText("Opened previous dump")).getByText("Email professor")).toBeVisible();
  view.unmount(); render(<App />);
  fireEvent.click(screen.getByRole("tab", { name: "History" }));
  fireEvent.change(screen.getByLabelText("Search previous thoughts"), { target: { value: "professor" } });
  fireEvent.change(screen.getByLabelText("History category"), { target: { value: "do" } });
  fireEvent.click(screen.getByRole("button", { name: "Open dump Imported dump" }));
  const opened = within(screen.getByLabelText("Opened previous dump"));
  expect(opened.getByText("Email professor")).toBeVisible();
  expect(opened.queryByText("Pick a course")).toBeNull();
  open();
  expect(screen.queryByText("Email professor", { selector: ".thought-text" })).toBeNull();
});

it("saves a personal reflection and displays outcomes, summaries, trends and wellness links", () => {
  seed([{ id: "r", text: "Choose a course", category: "decide", status: "resolved", decision: "Art" },
    { id: "c", text: "Send email", category: "do", status: "completed", completedAt: "2026-10-03T12:00:00Z" }]);
  const view = render(<App />);
  fireEvent.click(screen.getByRole("tab", { name: "Review" }));
  expect(screen.getByText(/2 thoughts in this dump: 0 active, 1 completed, 1 resolved/)).toBeVisible();
  expect(screen.getByRole("table", { name: "Category distribution across dumps" })).toBeVisible();
  expect(screen.getByRole("table", { name: "Completion and resolution across dumps" })).toBeVisible();
  fireEvent.click(screen.getByText("Review completed and resolved thoughts (2)", { selector: "summary" }));
  expect(within(screen.getByRole("tabpanel", { name: "Review" })).getByText("Decision: Art")).toBeVisible();
  expect(screen.getByRole("link", { name: /NHS: Every Mind Matters/ })).toHaveAttribute("rel", "noopener noreferrer");
  fireEvent.change(screen.getByLabelText("Personal reflection"), { target: { value: "One step at a time." } });
  fireEvent.click(screen.getByRole("button", { name: "Save reflection" }));
  view.unmount(); render(<App />);
  fireEvent.click(screen.getByRole("tab", { name: "Review" }));
  expect(screen.getByLabelText("Personal reflection")).toHaveValue("One step at a time.");
});
it("continues to show saved reminders after starting another dump and returns them to that dump", () => {
  seed([{ id: "cross", text: "Plan a trip", category: "do", status: "saved", revisitDate: "2020-01-01" }]);
  render(<App />);
  fireEvent.click(screen.getByRole("tab", { name: "History" }));
  fireEvent.change(screen.getByLabelText("New dump name"), { target: { value: "New" } });
  fireEvent.click(screen.getByRole("button", { name: "Start new dump" }));
  expect(screen.getByText(/Revisit reminder: Plan a trip/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Return to active" }));
  open();
  expect(screen.getByText("Plan a trip", { selector: ".thought-text" })).toBeVisible();
  expect(screen.queryByText(/Revisit reminder: Plan a trip/)).toBeNull();
});

it("still captures thoughts in memory when browser storage cannot be read", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage disabled"); });
  render(<App />);
  fireEvent.change(screen.getByLabelText("Thought 1"), { target: { value: "Keep this page open" } });
  fireEvent.click(screen.getByRole("button", { name: "Add Thought" }));
  open();
  expect(screen.getByText("Keep this page open", { selector: ".thought-text" })).toBeVisible();
  expect(screen.getByText(/Your changes are visible, but couldn't be saved/)).toBeVisible();
});
it("preserves corrupt history and unfinished input instead of overwriting either", () => {
  localStorage.setItem("brain-dump-workspace-v3", "corrupt");
  render(<App />);
  fireEvent.change(screen.getByLabelText("Thought 1"), { target: { value: "Unfinished" } });
  fireEvent.click(screen.getByRole("button", { name: "Add Thought" }));
  expect(screen.getByLabelText("Thought 1")).toHaveValue("Unfinished");
  expect(localStorage.getItem("brain-dump-workspace-v3")).toBe("corrupt");
});
