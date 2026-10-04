import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import App from "./App";

beforeEach(() => localStorage.clear());
afterEach(cleanup);
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
