import dotenv from "dotenv";

dotenv.config();

export const config = {
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  tavilyApiKey: process.env.TAVILY_API_KEY,
};
