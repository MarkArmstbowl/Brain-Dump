export const thoughtActions = {
  addMany: (thoughts) => ({ type: "thoughts/addMany", thoughts }),
  update: (id, changes) => ({ type: "thought/update", id, changes }),
  remove: (id) => ({ type: "thought/remove", id }),
  move: (id, category, beforeId = null) => ({
    type: "thought/move",
    id,
    category,
    beforeId
  }),
  togglePriority: (id) => ({ type: "thought/togglePriority", id }),
  selectNext: (id) => ({ type: "thought/selectNext", id }),
  clearNext: (id) => ({ type: "thought/clearNext", id }),
  complete: (id) => ({ type: "thought/complete", id }),
  restore: (id) => ({ type: "thought/restore", id }),
  recordDecision: (id, decision) => ({ type: "thought/recordDecision", id, decision }),
  resolveDecision: (id) => ({ type: "thought/resolveDecision", id }),
  dismiss: (id) => ({ type: "thought/dismiss", id })
};

function isActive(thought) {
  return !thought.status || thought.status === "active";
}

function normalizeThoughtState(thought) {
  const status = thought.status || "active";
  const normalized = {
    ...thought,
    status,
    isPriority:
      status === "active" &&
      thought.category === "do" &&
      Boolean(thought.isPriority),
    isNext:
      status === "active" &&
      thought.category === "do" &&
      Boolean(thought.isNext)
  };

  if (thought.category !== "decide") {
    normalized.decision = undefined;
    normalized.decidedAt = undefined;
    normalized.resolvedAt = undefined;
  }

  if (thought.category !== "let-go") {
    normalized.dismissedAt = undefined;
  }

  return normalized;
}

function addMany(state, newThoughts) {
  if (!Array.isArray(newThoughts) || newThoughts.length === 0) return state;
  return [
    ...state,
    ...newThoughts.map((thought) => normalizeThoughtState({
      ...thought,
      status: "active",
      isPriority: false,
      isNext: false
    }))
  ];
}

function updateThought(state, id, changes) {
  if (!state.some((thought) => thought.id === id)) return state;
  return state.map((thought) =>
    thought.id === id
      ? normalizeThoughtState({ ...thought, ...changes })
      : thought
  );
}

function moveThought(state, id, category, beforeId) {
  const thought = state.find((item) => item.id === id);
  if (!thought || beforeId === id) return state;

  const remaining = state.filter((item) => item.id !== id);
  if (!isActive(thought)) return state;

  const movedThought = normalizeThoughtState({ ...thought, category });
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
      if (!thought || thought.category !== "do" || !isActive(thought)) return state;
      return updateThought(state, action.id, { isPriority: !thought.isPriority });
    }
    case "thought/selectNext": {
      const selected = state.find((thought) => thought.id === action.id);
      if (!selected || selected.category !== "do" || !isActive(selected)) return state;
      return state.map((thought) => ({
        ...thought,
        isNext:
          isActive(thought) &&
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
      if (!thought || thought.category !== "do" || !isActive(thought)) return state;
      return updateThought(state, action.id, {
        status: "completed",
        completedAt: new Date().toISOString(),
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
    case "thought/recordDecision": {
      const thought = state.find((item) => item.id === action.id);
      const decision = typeof action.decision === "string" ? action.decision.trim() : "";
      if (!thought || thought.category !== "decide" || !isActive(thought) || !decision) {
        return state;
      }
      return updateThought(state, action.id, {
        decision,
        decidedAt: new Date().toISOString()
      });
    }
    case "thought/resolveDecision": {
      const thought = state.find((item) => item.id === action.id);
      if (
        !thought ||
        thought.category !== "decide" ||
        !isActive(thought) ||
        !thought.decision?.trim()
      ) {
        return state;
      }
      return updateThought(state, action.id, {
        status: "resolved",
        resolvedAt: new Date().toISOString()
      });
    }
    case "thought/dismiss": {
      const thought = state.find((item) => item.id === action.id);
      if (!thought || thought.category !== "let-go" || !isActive(thought)) return state;
      return updateThought(state, action.id, {
        status: "dismissed",
        dismissedAt: new Date().toISOString()
      });
    }
    default:
      return state;
  }
}
