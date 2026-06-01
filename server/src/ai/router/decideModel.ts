import { AIRequest, AIModel } from "../types/ai.types";

export function getModelPriority(data: AIRequest): AIModel[] {
  const { prompt, task, userPlan, speedPriority } = data;

  // Premium users: OpenAI is locked in and prioritized
  if (userPlan === "premium") {
    return ["openai", "gemini", "deepseek", "groq"];
  }

  // Long prompts prefer stronger reasoning
  if (prompt && prompt.length > 10000) {
    return ["gemini", "deepseek", "groq"];
  }

  // Coding tasks prefer code-specialized model
  if (task === "coding") {
    return ["deepseek", "gemini", "groq"];
  }

  // Speed-first requests
  if (speedPriority) {
    return ["groq", "gemini", "deepseek"];
  }

  // Default fallback chain
  return ["gemini", "deepseek", "groq"];
}

export function decideModel(data: AIRequest): AIModel {
  return getModelPriority(data)[0];
}