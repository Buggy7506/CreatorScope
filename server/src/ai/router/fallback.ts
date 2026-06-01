import { useGemini } from "../providers/gemini";
import { useGroq } from "../providers/groq";

export async function fallbackModel(prompt: string) {
  try {
    return await useGemini(prompt);
  } catch (error) {
    console.log("Gemini failed -> switching to Groq", error);
    return useGroq(prompt);
  }
}
