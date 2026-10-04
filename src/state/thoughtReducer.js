import { getPriority, PRIORITY_LEVELS } from "../constants";

export const thoughtActions = {
  restoreRemoved: (entries) => ({ type: "thoughts/restoreRemoved", entries }),
  clearActive: () => ({ type: "thoughts/clearActive" }),
  addMany: (thoughts) => ({ type: "thoughts/addMany", thoughts }),
  update: (id, changes) => ({ type: "thought/update", id, changes }),
  remove: (id) => ({ type: "thought/remove", id }),
  move: (id, category, beforeId = null) => ({
    type: "thought/move",
    id,
    category,
    beforeId
  }),
  setPriority: (id, priority) => ({ type: "thought/setPriority", id, priority }),
  sortPriority: () => ({ type: "thoughts/sortPriority" }),
  categorizeMany: (choices) => ({ type: "thoughts/categorizeMany", choices }),
  togglePriority: (id) => ({ type: "thought/togglePriority", id }),
  selectNext: (id) => ({ type: "thought/selectNext", id }),
  clearNext: (id) => ({ type: "thought/clearNext", id }),
  complete: (id) => ({ type: "thought/complete", id }),
  restore: (id) => ({ type: "thought/restore", id })
};

function keepDoOnlyState(thought) {
  if (thought.category === "do") {
    return {
      ...thought,
      status: thought.status || "active",
      priority: getPriority(thought),
      isPriority: getPriority(thought) !== "none",
      isNext: Boolean(thought.isNext)
    };
  }
  return {
    ...thought,
    status: thought.status || "active",
    priority: "none",
    isPriority: false,
    isNext: false
  };
}

function addMany(state, newThoughts) {
  if (!Array.isArray(newThoughts) || newThoughts.length === 0) return state;
  return [
    ...state,
    ...newThoughts.map((thought) => keepDoOnlyState({
      ...thought,
      createdAt: thought.createdAt || new Date().toISOString(),
      updatedAt: thought.updatedAt || new Date().toISOString(),
      status: "active",
      priority: "none",
      isPriority: false,
      isNext: false
    }))
  ];
}

function updateThought(state, id, changes) {
  if (!state.some((thought) => thought.id === id)) return state;
  return state.map((thought) =>
    thought.id === id
      ? keepDoOnlyState({ ...thought, ...changes, updatedAt: new Date().toISOString() })
      : thought
  );
}

function moveThought(state, id, category, beforeId) {
  const thought = state.find((item) => item.id === id);
  if (!thought || beforeId === id) return state;

  const remaining = state.filter((item) => item.id !== id);
  const movedThought = keepDoOnlyState({ ...thought, category });
  let insertionIndex;

  if (beforeId) {
    insertionIndex = remaining.findIndex(
      (item) => item.id === beforeId && item.category === category
    );
    if (insertionIndex < 0) return state;
  } else {
    const lastCategoryIndex = remaining.reduce(
      (lastIndex, item, index) => item.category === category ? index : lastIndex,
      -1
    );
    insertionIndex = lastCategoryIndex === -1 ? remaining.length : lastCategoryIndex + 1;
  }

  const nextState = [...remaining];
  nextState.splice(insertionIndex, 0, movedThought);
  return nextState;
}

export function thoughtReducer(state, action) {
  switch (action.type) {
    case "thoughts/categorizeMany":
      return action.choices.reduce((next, { id, category }) => updateThought(next, id, { category }), state);
    case "thought/setPriority": {
      const thought = state.find((item) => item.id === action.id);
      if (!thought || thought.category !== "do" || thought.status === "completed" || !PRIORITY_LEVELS.includes(action.priority)) return state;
      return updateThought(state, action.id, { priority: action.priority });
    }
    case "thoughts/sortPriority": {
      const sorted = state.filter((thought) => thought.category === "do" && thought.status !== "completed")
        .sort((a, b) => PRIORITY_LEVELS.indexOf(getPriority(b)) - PRIORITY_LEVELS.indexOf(getPriority(a)));
      let index = 0;
      return state.map((thought) => thought.category === "do" && thought.status !== "completed" ? sorted[index++] : thought);
    }
    case "thoughts/clearActive":
      return state.filter((thought) => thought.status === "completed");
    case "thoughts/restoreRemoved": {
      const next = [...state];
      for (const { thought, index } of action.entries) {
        if (!next.some((item) => item.id === thought.id)) next.splice(index, 0, {
          ...thought, isNext: thought.isNext && !next.some((item) => item.isNext)
        });
      }
      return next;
    }
    case "thoughts/addMany":
      return addMany(state, action.thoughts);
    case "thought/update":
      return updateThought(state, action.id, action.changes);
    case "thought/remove": {
      const nextState = state.filter((thought) => thought.id !== action.id);
      return nextState.length === state.length ? state : nextState;
    }
    case "thought/move":
      return moveThought(state, action.id, action.category, action.beforeId);
    case "thought/togglePriority": {
      const thought = state.find((item) => item.id === action.id);
      if (!thought || thought.category !== "do" || thought.status === "completed") return state;
      return updateThought(state, action.id, { priority: thought.isPriority ? "none" : "medium" });
    }
    case "thought/selectNext": {
      const selected = state.find((thought) => thought.id === action.id);
      if (!selected || selected.category !== "do" || selected.status === "completed") return state;
      return state.map((thought) => ({
        ...thought,
        isNext:
          thought.status !== "completed" &&
          thought.category === "do" &&
          thought.id === action.id
      }));
    }
    case "thought/clearNext": {
      const thought = state.find((item) => item.id === action.id);
      if (!thought?.isNext) return state;
      return updateThought(state, action.id, { isNext: false });
    }
    case "thought/complete": {
      const thought = state.find((item) => item.id === action.id);
      if (!thought || thought.status === "completed") return state;
      return updateThought(state, action.id, {
        status: "completed",
        completedAt: new Date().toISOString(),
        priority: "none",
        isPriority: false,
        isNext: false
      });
    }
    case "thought/restore": {
      const thought = state.find((item) => item.id === action.id);
      if (!thought || thought.status !== "completed") return state;
      return updateThought(state, action.id, {
        status: "active",
        completedAt: undefined
      });
    }
    default:
      return state;
  }
}
