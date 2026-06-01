import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,

  DATABASE_URL: process.env.DATABASE_URL as string,

  JWT_SECRET: process.env.JWT_SECRET as string,

  FRONTEND_URL: process.env.FRONTEND_URL as string,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
  GROQ_API_KEY: process.env.GROQ_API_KEY as string,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY as string,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,

  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,

  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI as string,
  
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID as string,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET as string,
  MICROSOFT_REDIRECT_URI: process.env.MICROSOFT_REDIRECT_URI as string,

  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID as string,
  APPLE_CLIENT_SECRET: process.env.APPLE_CLIENT_SECRET as string,
  APPLE_REDIRECT_URI: process.env.APPLE_REDIRECT_URI as string,
};