import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getCategorySuggestion } from "./api/categorySuggestion";
import {
  getFirstStepSuggestion,
  getNextSuggestion,
  getPrioritySuggestion
} from "./api/focusSuggestions";

vi.mock("./api/categorySuggestion", () => ({
  getCategorySuggestion: vi.fn()
}));

vi.mock("./api/focusSuggestions", () => ({
  getFirstStepSuggestion: vi.fn(),
  getNextSuggestion: vi.fn(),
  getPrioritySuggestion: vi.fn()
}));

const THOUGHT_STORAGE_KEY = "brain-dump-thoughts";
const CONSENT_STORAGE_KEY = "brain-dump-ai-consent";
const PLANNING_CONSENT_STORAGE_KEY = "brain-dump-planning-ai-consent";

function seedThoughts(thoughts) {
  localStorage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify(thoughts));
}

async function openOrganize(user) {
  await user.click(screen.getByRole("tab", { name: /Organize/i }));
}

function createDataTransfer() {
  const values = new Map();
  return {
    effectAllowed: "none",
    setData: (type, value) => values.set(type, value),
    getData: (type) => values.get(type) || ""
  };
}

describe("Brain Dump features", () => {
  beforeEach(() => {
    localStorage.clear();
    getCategorySuggestion.mockReset();
    getFirstStepSuggestion.mockReset();
    getNextSuggestion.mockReset();
    getPrioritySuggestion.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("adds, views, edits, deletes, and persists a thought", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Thought 1"), "Finish Agile assignment");
    await user.click(screen.getByRole("button", { name: "Add Thought" }));
    await openOrganize(user);

    expect(screen.getByText("Finish Agile assignment")).toBeVisible();
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const editInput = screen.getByLabelText("Edit thought");
    await user.clear(editInput);
    await user.type(editInput, "Finish Agile feature map");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByText("Finish Agile feature map")).toBeVisible();
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].text)
      .toBe("Finish Agile feature map");

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("A little more room to think.")).toBeVisible();
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))).toEqual([]);
  });

  it("adds multiple categorized and uncategorized thoughts and filters them", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Thought 1"), "Book dentist");
    await user.click(screen.getByLabelText("Category"));
    await user.click(screen.getByRole("option", { name: "Do" }));
    await user.click(screen.getByRole("button", { name: "Add another thought" }));
    await user.type(screen.getByLabelText("Thought 2"), "Maybe change classes");
    await user.click(screen.getByRole("button", { name: "Add 2 Thoughts" }));
    await openOrganize(user);

    expect(screen.getByText("2 thoughts")).toBeVisible();
    expect(screen.getByText("Book dentist")).toBeVisible();
    expect(screen.getByText("Maybe change classes")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Show Do" }));
    expect(screen.getByText("Book dentist")).toBeVisible();
    expect(screen.queryByText("Maybe change classes")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show Unsorted" }));
    expect(screen.getByText("Maybe change classes")).toBeVisible();
    expect(screen.queryByText("Book dentist")).not.toBeInTheDocument();
  });

  it("splits pasted lines and reorders cards with drag and drop", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Paste multiple thoughts" }));
    await user.type(
      screen.getByLabelText("Paste your list"),
      "1. First thought\n- Second thought\n• Third thought"
    );
    await user.click(screen.getByRole("button", { name: "Split into thoughts" }));

    expect(screen.getByLabelText("Thought 1")).toHaveValue("First thought");
    expect(screen.getByLabelText("Thought 2")).toHaveValue("Second thought");
    expect(screen.getByLabelText("Thought 3")).toHaveValue("Third thought");

    await user.click(screen.getByRole("button", { name: "Add 3 Thoughts" }));
    await openOrganize(user);

    const firstCard = screen.getByText("First thought").closest("li");
    const thirdCard = screen.getByText("Third thought").closest("li");
    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(thirdCard, { dataTransfer });
    fireEvent.drop(firstCard, { dataTransfer });

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY));
      expect(saved.map(({ text }) => text)).toEqual([
        "Third thought",
        "First thought",
        "Second thought"
      ]);
    });
  });

  it("reorders with keyboard and touch-friendly buttons while keeping focus", async () => {
    seedThoughts([
      { id: "first", text: "First thought", category: "unsorted" },
      { id: "second", text: "Second thought", category: "unsorted" },
      { id: "third", text: "Third thought", category: "unsorted" }
    ]);
    const user = userEvent.setup();
    const firstRender = render(<App />);
    await openOrganize(user);

    const moveThirdUp = screen.getByRole("button", { name: "Move Third thought up" });
    moveThirdUp.focus();
    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(moveThirdUp);
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY)).map(({ id }) => id))
      .toEqual(["first", "third", "second"]);

    await user.keyboard("{Enter}");
    expect(document.activeElement).toBe(moveThirdUp);
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY)).map(({ id }) => id))
      .toEqual(["third", "first", "second"]);
    expect(screen.getByRole("button", { name: "Move Third thought up" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Move Third thought down" }));
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY)).map(({ id }) => id))
      .toEqual(["first", "third", "second"]);

    firstRender.unmount();
    render(<App />);
    await openOrganize(user);
    const unsortedGroup = screen.getByRole("heading", { name: "Unsorted" }).closest("section");
    expect(within(unsortedGroup).getAllByText(/thought$/, { selector: ".thought-text" })
      .map((element) => element.textContent))
      .toEqual(["First thought", "Third thought", "Second thought"]);
  });

  it("moves a thought between category groups by dragging it", async () => {
    seedThoughts([
      { id: "move-me", text: "Send the email", category: "do" }
    ]);
    const user = userEvent.setup();
    render(<App />);
    await openOrganize(user);

    const card = screen.getByText("Send the email").closest("li");
    const decideGroup = screen.getByRole("heading", { name: "Decide" }).closest("section");
    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.drop(decideGroup, { dataTransfer });

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].category)
        .toBe("decide");
    });
  });

  it("accepts or overrides an AI category suggestion without moving early", async () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    seedThoughts([
      { id: "accept", text: "Submit the form", category: "unsorted" },
      { id: "override", text: "Think about the invitation", category: "do" }
    ]);
    getCategorySuggestion
      .mockResolvedValueOnce({ category: "do", reason: "It is actionable." })
      .mockResolvedValueOnce({ category: "decide", reason: "A choice is needed." });

    const user = userEvent.setup();
    render(<App />);
    await openOrganize(user);

    const acceptCard = screen.getByText("Submit the form").closest("li");
    await user.click(within(acceptCard).getByRole("button", { name: "Suggest category" }));
    expect(await within(acceptCard).findByText(/AI suggests/)).toBeVisible();
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].category)
      .toBe("unsorted");
    await user.click(within(acceptCard).getByRole("button", { name: "Accept suggestion" }));
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].category).toBe("do");

    const overrideCard = screen.getByText("Think about the invitation").closest("li");
    await user.click(within(overrideCard).getByRole("button", { name: "Suggest category" }));
    expect(await within(overrideCard).findByText(/AI suggests/)).toBeVisible();
    await user.click(within(overrideCard).getByRole("button", { name: "Choose another" }));
    expect(within(overrideCard).getByLabelText("Your category")).toHaveTextContent("Do");
    await user.click(within(overrideCard).getByLabelText("Your category"));
    await user.click(screen.getByRole("option", { name: "Let Go" }));
    await user.click(within(overrideCard).getByRole("button", { name: "Use my choice" }));

    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[1].category)
      .toBe("let-go");
  });

  it("cancels an in-flight AI request when its thought is deleted", async () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    seedThoughts([{ id: "cancel", text: "Temporary thought", category: "unsorted" }]);
    let receivedSignal;
    getCategorySuggestion.mockImplementation((_text, { signal }) => {
      receivedSignal = signal;
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason));
      });
    });

    const user = userEvent.setup();
    render(<App />);
    await openOrganize(user);
    await user.click(screen.getByRole("button", { name: "Suggest category" }));

    expect(receivedSignal.aborted).toBe(false);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(receivedSignal.aborted).toBe(true);
    expect(screen.getByText("A little more room to think.")).toBeVisible();
  });

  it("cancels an AI request that exceeds the 15-second timeout", async () => {
    vi.useFakeTimers();
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    seedThoughts([{ id: "timeout", text: "Slow request", category: "unsorted" }]);
    let receivedSignal;
    getCategorySuggestion.mockImplementation((_text, { signal }) => {
      receivedSignal = signal;
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason));
      });
    });

    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: /Organize/i }));
    fireEvent.click(screen.getByRole("button", { name: "Suggest category" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(receivedSignal.aborted).toBe(true);
    expect(screen.getByText("The AI suggestion timed out. Please try again."))
      .toBeVisible();
  });

  it("shows a retryable provider error without changing the thought", async () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "granted");
    seedThoughts([{ id: "error", text: "Keep this thought", category: "unsorted" }]);
    getCategorySuggestion.mockRejectedValue(new Error("The AI service is unavailable."));

    const user = userEvent.setup();
    render(<App />);
    await openOrganize(user);
    await user.click(screen.getByRole("button", { name: "Suggest category" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The AI service is unavailable."
    );
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0])
      .toMatchObject({ text: "Keep this thought", category: "unsorted" });
  });

  it("marks, persists, changes, and clears priority for Do thoughts", async () => {
    seedThoughts([{ id: "priority", text: "Prepare the demo", category: "do" }]);
    const user = userEvent.setup();
    const firstRender = render(<App />);
    await openOrganize(user);

    await user.click(screen.getByRole("button", { name: "Mark priority" }));
    expect(screen.getByText("Priority")).toBeVisible();
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].isPriority).toBe(true);

    firstRender.unmount();
    render(<App />);
    await openOrganize(user);
    expect(screen.getByRole("button", { name: "Remove priority" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Remove priority" }));
    expect(screen.queryByText("Priority")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].isPriority).toBe(false);

    await user.click(screen.getByRole("button", { name: "Mark priority" }));
    const card = screen.getByText("Prepare the demo").closest("li");
    const decideGroup = screen.getByRole("heading", { name: "Decide" }).closest("section");
    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.drop(decideGroup, { dataTransfer });

    await waitFor(() => {
      const savedThought = JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0];
      expect(savedThought).toMatchObject({ category: "decide", isPriority: false });
    });
    expect(screen.queryByRole("button", { name: /^(Mark|Remove) priority$/i }))
      .not.toBeInTheDocument();
  });

  it("selects one Next item, changes it, and persists the selection", async () => {
    seedThoughts([
      { id: "first", text: "Draft the outline", category: "do" },
      { id: "second", text: "Email the team", category: "do" }
    ]);
    const user = userEvent.setup();
    const firstRender = render(<App />);
    await openOrganize(user);

    const firstCard = screen.getByText("Draft the outline").closest("li");
    const secondCard = screen.getByText("Email the team").closest("li");
    await user.click(within(firstCard).getByRole("button", { name: "Make Next" }));
    expect(within(firstCard).getByText("Next")).toBeVisible();

    await user.click(within(secondCard).getByRole("button", { name: "Make Next" }));
    const savedAfterChange = JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY));
    expect(savedAfterChange.filter(({ isNext }) => isNext)).toEqual([
      expect.objectContaining({ id: "second" })
    ]);
    expect(within(secondCard).getByRole("button", { name: "Current Next" })).toBeDisabled();
    expect(within(firstCard).getByRole("button", { name: "Make Next" })).toBeEnabled();

    firstRender.unmount();
    render(<App />);
    await openOrganize(user);
    const reloadedSecondCard = screen
      .getByText("Email the team", { selector: ".thought-text" })
      .closest("li");
    expect(within(reloadedSecondCard).getByRole("button", { name: "Current Next" }))
      .toBeDisabled();

    const decideGroup = screen.getByRole("heading", { name: "Decide" }).closest("section");
    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(reloadedSecondCard, { dataTransfer });
    fireEvent.drop(decideGroup, { dataTransfer });
    await waitFor(() => {
      const movedThought = JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))
        .find(({ id }) => id === "second");
      expect(movedThought).toMatchObject({ category: "decide", isNext: false });
    });
    expect(screen.getByText("No Next item selected yet.")).toBeVisible();
  });

  it("applies AI priority, Next, and smaller-step suggestions only after confirmation", async () => {
    localStorage.setItem(PLANNING_CONSENT_STORAGE_KEY, "granted");
    seedThoughts([
      { id: "first", text: "Prepare the entire presentation", category: "do" },
      { id: "second", text: "Confirm the meeting room", category: "do" }
    ]);
    getPrioritySuggestion.mockResolvedValue({ thoughtId: "second" });
    getNextSuggestion.mockResolvedValue({ thoughtId: "first" });
    getFirstStepSuggestion.mockResolvedValue({ step: "Write the presentation title" });

    const user = userEvent.setup();
    render(<App />);
    await openOrganize(user);

    await user.click(screen.getByRole("button", { name: "Suggest a priority" }));
    expect(await screen.findByLabelText("AI priority suggestion"))
      .toHaveTextContent(/Confirm the meeting room.*priority/i);
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[1].isPriority)
      .not.toBe(true);
    await user.click(screen.getByRole("button", { name: "Mark as priority" }));
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[1].isPriority).toBe(true);

    await user.click(screen.getByRole("button", { name: "Recommend my Next item" }));
    expect(await screen.findByLabelText("AI next suggestion"))
      .toHaveTextContent(/Prepare the entire presentation.*Next item/i);
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].isNext)
      .not.toBe(true);
    await user.click(screen.getByRole("button", { name: "Make this Next" }));
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].isNext).toBe(true);

    const presentationCard = screen
      .getByText("Prepare the entire presentation", { selector: ".thought-text" })
      .closest("li");
    await user.click(
      within(presentationCard).getByRole("button", { name: "Break into first step" })
    );
    expect(await within(presentationCard).findByText(/Write the presentation title/))
      .toBeVisible();
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].text)
      .toBe("Prepare the entire presentation");
    await user.click(
      within(presentationCard).getByRole("button", { name: "Use this first step" })
    );
    expect(JSON.parse(localStorage.getItem(THOUGHT_STORAGE_KEY))[0].text)
      .toBe("Write the presentation title");
  });

  it("asks before sending all Do thoughts to AI focus tools", async () => {
    seedThoughts([
      { id: "first", text: "First private Do thought", category: "do" },
      { id: "second", text: "Second private Do thought", category: "do" },
      { id: "decide", text: "A Decide thought", category: "decide" }
    ]);
    getPrioritySuggestion.mockResolvedValue({ thoughtId: "first" });

    const user = userEvent.setup();
    render(<App />);
    await openOrganize(user);
    await user.click(screen.getByRole("button", { name: "Suggest a priority" }));

    expect(screen.getByRole("heading", { name: "Before using AI focus tools" })).toBeVisible();
    expect(screen.getByText("First private Do thought", { selector: "li" })).toBeVisible();
    expect(screen.getByText("Second private Do thought", { selector: "li" })).toBeVisible();
    expect(screen.queryByText("A Decide thought", { selector: "li" })).not.toBeInTheDocument();
    expect(getPrioritySuggestion).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "I understand — send to Groq" }));
    await waitFor(() => expect(getPrioritySuggestion).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem(PLANNING_CONSENT_STORAGE_KEY)).toBe("granted");
  });
});
