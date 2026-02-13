import { TavilySearch } from "@langchain/tavily";
import { config } from "./config";

const tavilySearchTool = new TavilySearch({
  tavilyApiKey: config.tavilyApiKey,
  maxResults: 2,
  topic: "general",
});

export const tools = [tavilySearchTool];
