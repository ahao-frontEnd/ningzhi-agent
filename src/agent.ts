import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { ChatDeepSeek } from "@langchain/deepseek";

type AgentMessage = { role: "user" | "ai"; content: string };

const AgentState = Annotation.Root({
  messages: Annotation<AgentMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});

const graph = new StateGraph(AgentState, {
  nodes: ["respond-test"] as const,
});

const model = new ChatDeepSeek({
  model: "deepseek-chat",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

graph.addNode("respond-test", async (state: typeof AgentState.State) => {

  const response = await model.invoke([
    { role: "system", content: "你是一个简洁、友好的 AI 助手。" },
    ...state.messages
  ]);

  return {
    messages: [
      {
        role: "ai",
        content: response.content.toString(),
      },
    ],
  };
});

graph.addEdge(START, "respond-test");
graph.addEdge("respond-test", END);

export const agentGraph = graph.compile();
