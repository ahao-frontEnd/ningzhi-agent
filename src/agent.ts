import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatDeepSeek } from "@langchain/deepseek";
import { TavilySearch } from "@langchain/tavily";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatDeepSeek({
  model: "deepseek-chat",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const TavilySearchTool = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY,
  maxResults: 2,
  topic: "general",
});
const tools = [TavilySearchTool];

const modelWithTools = model.bindTools(tools);
const toolNode = new ToolNode(tools);

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await modelWithTools.invoke([
    { role: "system", content: "你是一个简洁、友好的 AI 助手。" },
    ...state.messages,
  ]);
  return { messages: [response] };
};

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent");

export const agentGraph = graph.compile();
