import { ChatDeepSeek } from "@langchain/deepseek";
import { config } from "./config";

export const model = new ChatDeepSeek({
  model: "deepseek-chat",
  apiKey: config.deepseekApiKey,
});
