import dotenv from "dotenv";

dotenv.config();

const readString = (key: string, fallback = "") => {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : fallback;
};

const readPort = () => {
  const rawPort = readString("PORT", "5000");
  const parsedPort = Number.parseInt(rawPort, 10);

  return Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5000;
};

export const env = {
  PORT: readPort(),
  DATABASE_URL: readString("DATABASE_URL"),
  JWT_SECRET: readString("JWT_SECRET", "creatorscope-dev-secret-change-me"),
  FRONTEND_URL: readString("FRONTEND_URL", "http://localhost:5173"),

  OPENAI_API_KEY: readString("OPENAI_API_KEY"),
  GEMINI_API_KEY: readString("GEMINI_API_KEY"),
  GROQ_API_KEY: readString("GROQ_API_KEY"),
  DEEPSEEK_API_KEY: readString("DEEPSEEK_API_KEY"),

  GOOGLE_CLIENT_ID: readString("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: readString("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REDIRECT_URI: readString("GOOGLE_REDIRECT_URI"),
  YOUTUBE_REDIRECT_URI: readString(
    "YOUTUBE_REDIRECT_URI",
    readString(
      "GOOGLE_REDIRECT_URI",
      "http://localhost:5000/api/v1/connect/youtube/callback",
    ),
  ),

  TIKTOK_CLIENT_KEY: readString("TIKTOK_CLIENT_KEY"),
  TIKTOK_CLIENT_SECRET: readString("TIKTOK_CLIENT_SECRET"),
  TIKTOK_REDIRECT_URI: readString(
    "TIKTOK_REDIRECT_URI",
    "http://localhost:5000/api/v1/connect/tiktok/callback",
  ),

  INSTAGRAM_CLIENT_ID: readString("INSTAGRAM_CLIENT_ID"),
  INSTAGRAM_CLIENT_SECRET: readString("INSTAGRAM_CLIENT_SECRET"),
  INSTAGRAM_REDIRECT_URI: readString(
    "INSTAGRAM_REDIRECT_URI",
    "http://localhost:5000/api/v1/connect/instagram/callback",
  ),

  MICROSOFT_CLIENT_ID: readString("MICROSOFT_CLIENT_ID"),
  MICROSOFT_CLIENT_SECRET: readString("MICROSOFT_CLIENT_SECRET"),
  MICROSOFT_REDIRECT_URI: readString("MICROSOFT_REDIRECT_URI"),

  STRIPE_SECRET_KEY: readString("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: readString("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRO_PRICE_ID: readString("STRIPE_PRO_PRICE_ID"),
  STRIPE_ENTERPRISE_PRICE_ID: readString("STRIPE_ENTERPRISE_PRICE_ID"),

  APPLE_CLIENT_ID: readString("APPLE_CLIENT_ID"),
  APPLE_CLIENT_SECRET: readString("APPLE_CLIENT_SECRET"),
  APPLE_REDIRECT_URI: readString("APPLE_REDIRECT_URI"),
};
