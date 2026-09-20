const AI_CONSENT_KEY = "brain-dump-ai-consent";
const PLANNING_AI_CONSENT_KEY = "brain-dump-planning-ai-consent";

export const AI_CONSENT_SAVE_ERROR =
  "Your AI consent applies for this session, but couldn't be remembered in this browser.";

export function loadAiConsent() {
  try {
    return localStorage.getItem(AI_CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function saveAiConsent() {
  try {
    localStorage.setItem(AI_CONSENT_KEY, "granted");
    return "";
  } catch {
    return AI_CONSENT_SAVE_ERROR;
  }
}

export function loadPlanningAiConsent() {
  try {
    return localStorage.getItem(PLANNING_AI_CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function savePlanningAiConsent() {
  try {
    localStorage.setItem(PLANNING_AI_CONSENT_KEY, "granted");
    return "";
  } catch {
    return AI_CONSENT_SAVE_ERROR;
  }
}
