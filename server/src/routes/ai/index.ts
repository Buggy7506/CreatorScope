import { Router } from "express";
import OpenAI from "openai";

import { env } from "../../config/env";
import { decideModel } from "../../ai/router/decideModel";
import { executeModel } from "../../ai/router/executeModel";
import { fallbackModel } from "../../ai/router/fallback";

const router = Router();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

router.post("/caption", async (req, res) => {
  try {

    const {
      topic,
      platform,
      tone,
    } = req.body || {};

    if (!topic) {
      return res.status(400).json({
        message: "Topic is required",
      });
    }

    const prompt = `
Generate a highly engaging social media caption.

Topic: ${topic}

Platform: ${platform || "YouTube"}

Tone: ${tone || "viral"}

Include:
- hook
- emojis
- call to action
- hashtags
`;

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const caption =
      completion.choices[0]?.message?.content;

    return res.json({
      success: true,
      caption,
    });

} catch (error: any) {

  console.error(error);

  return res.status(500).json({
    message: "Caption generation failed",

    error:
      error?.error?.message ||
      error?.message ||
      "Unknown error",
  });
}
});

router.post("/generate", async (req, res) => {
  try {
    const { prompt, task, userPlan, speedPriority } = req.body;

    if (!prompt || !task || !userPlan) {
      return res.status(400).json({
        success: false,
        message: "prompt, task, and userPlan are required",
      });
    }

    const selectedModel = decideModel({
      prompt,
      task,
      userPlan,
      speedPriority,
    });

    try {
      const response = await executeModel(selectedModel, prompt);

      return res.json({
        success: true,
        model: selectedModel,
        response,
      });
    } catch (executionError) {
      console.error("Model execution failed", executionError);
      const fallbackResponse = await fallbackModel(prompt);

      return res.json({
        success: true,
        model: selectedModel,
        fallback: true,
        response: fallbackResponse,
      });
    }
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "AI generation failed",
    });
  }
});

export default router;