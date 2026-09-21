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
  selectNext: (id) => ({ type: "thought/selectNext", id })
};

function keepDoOnlyState(thought) {
  if (thought.category === "do") {
    return {
      ...thought,
      isPriority: Boolean(thought.isPriority),
      isNext: Boolean(thought.isNext)
    };
  }
  return { ...thought, isPriority: false, isNext: false };
}

function addMany(state, newThoughts) {
  if (!Array.isArray(newThoughts) || newThoughts.length === 0) return state;
  return [
    ...state,
    ...newThoughts.map((thought) => keepDoOnlyState({
      ...thought,
      isPriority: false,
      isNext: false
    }))
  ];
}

function updateThought(state, id, changes) {
  if (!state.some((thought) => thought.id === id)) return state;
  return state.map((thought) =>
    thought.id === id
      ? keepDoOnlyState({ ...thought, ...changes })
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
      if (!thought || thought.category !== "do") return state;
      return updateThought(state, action.id, { isPriority: !thought.isPriority });
    }
    case "thought/selectNext": {
      const selected = state.find((thought) => thought.id === action.id);
      if (!selected || selected.category !== "do") return state;
      return state.map((thought) => ({
        ...thought,
        isNext: thought.category === "do" && thought.id === action.id
      }));
    }
    default:
      return state;
  }
}
