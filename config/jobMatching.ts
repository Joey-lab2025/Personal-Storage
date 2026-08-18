export const JOB_MATCHING = {
  priority: 85,
  recommended: 75,
  consider: 65,
} as const;

export type JobCategory = "priority" | "recommended" | "consider" | "skip";

export function categoryForScore(score: number): JobCategory {
  if (score >= JOB_MATCHING.priority) return "priority";
  if (score >= JOB_MATCHING.recommended) return "recommended";
  if (score >= JOB_MATCHING.consider) return "consider";
  return "skip";
}
