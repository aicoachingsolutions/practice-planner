/**
 * Coach-first product copy. Company name stays in footer/legal;
 * the product voice is about saving coaches time, not showcasing AI.
 */

/** Legal / copyright entity */
export const BRAND_COMPANY = "AI Coaching Solutions";

/** Shown in headers — positions the product, not the tech */
export const PLATFORM_LABEL = "Coach platform";

export const PRODUCT_NAME = "Practice Planner";

export const PRODUCT_TAGLINE = "Less time planning. More time coaching.";

export const PRODUCT_DESCRIPTION =
  "Plan practices faster with sport templates, your drill library, and quick courtside edits — built for coaches who want time back.";

/** Mention AI only in “how it works” explanations */
export const SMART_PLAN_HOW_IT_WORKS =
  "How it works: we use AI behind the scenes to draft a first pass from your focus and saved drills. You always review and edit before practice — same as building from your library, just faster to start.";

export const COPY = {
  smartPlanEyebrow: "Save time",
  smartPlanTitle: "Quick plan from today's focus",
  smartPlanLede:
    "Describe what you're working on. We'll draft a full editable practice from your drill library so you spend less time planning.",
  smartPlanButton: "Quick plan",
  smartPlanButtonPro: "Quick plan — Pro",
  smartPlanProRequired: "Quick plan from focus requires Pro.",
  smartPlanProHelp:
    "Pro helps you plan faster: save practices, swap drills courtside, and regenerate when your focus changes.",
  smartPlanFocusRequired: "Add what you want to work on today.",
  smartPlanNotConfigured: "Quick plan isn't available right now. Use Build practice from my drills.",
  smartPlanSuccess: "Practice plan ready — review and edit before you run it.",
  smartPlanFallbackSuccess:
    "We built this plan from your drills instead — review and adjust before practice.",
  smartPlanFailed: "Couldn't build that plan. Try again or use Build practice from my drills.",
  closeQuickPlan: "Close quick plan",
  optionalDrillHint: "Optional. We'll still fill the rest of the plan from your active drills first.",
} as const;

/** Strip technical AI errors before showing coaches a redirect message. */
export function coachFacingPlanError(message: string): string {
  if (/openai|gpt|ai response|ai generation/i.test(message)) {
    return COPY.smartPlanFailed;
  }
  return message;
}
