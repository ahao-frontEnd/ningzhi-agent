import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { callModel } from "./callModel";
import { toolNode } from "./toolNode";

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent");

export const agentGraph = graph.compile();
