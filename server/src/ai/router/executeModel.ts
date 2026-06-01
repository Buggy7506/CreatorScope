import { useGemini } from "../providers/gemini";
import { useGroq } from "../providers/groq";
import { useDeepSeek } from "../providers/deepseek";
import { useOpenAI } from "../providers/openai";

export async function executeModel(model: string, prompt: string) {
  switch (model) {
    case "gemini":
      return useGemini(prompt);

    case "groq":
      return useGroq(prompt);

    case "deepseek":
      return useDeepSeek(prompt);

    case "openai":
      return useOpenAI(prompt);

    default:
      return useGemini(prompt);
  }
}
