/** FRONTEND_SPEC §51 — suggested assistant questions */

export interface SuggestedPrompt {
  id: string;
  label: string;
  message: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "prompt_waste",
    label: "Why was waste higher this month?",
    message: "Why was waste higher this month?",
  },
  {
    id: "prompt_inventory",
    label: "What inventory should we prioritize?",
    message: "What inventory should we prioritize this week?",
  },
  {
    id: "prompt_expiring",
    label: "What food expires next week?",
    message: "What food expires next week?",
  },
  {
    id: "prompt_events",
    label: "Which events generated the most waste?",
    message: "Which events generated the most waste?",
  },
  {
    id: "prompt_thursday",
    label: "Thursday surplus projection",
    message:
      "What is projected for next Thursday and how can we prevent waste?",
  },
];
