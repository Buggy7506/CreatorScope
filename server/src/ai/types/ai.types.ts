export type UserPlan = "free" | "premium";

export type TaskType =
  | "chat"
  | "coding"
  | "analysis"
  | "summary";

export type AIModel =
  | "gemini"
  | "groq"
  | "deepseek"
  | "openai";

export interface AIRequest {
  prompt: string;
  task: TaskType;
  userPlan: UserPlan;
  speedPriority?: boolean;
}
