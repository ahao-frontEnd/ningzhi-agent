import { StateGraph, START, END } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { callModel } from "./nodes/callModel";
import { toolNode } from "./nodes/toolNode";
import { extractPdf } from "./nodes/extractPdf";
import { AgentState } from "./state";

const graph = new StateGraph(AgentState)
  .addNode("extractPdf", extractPdf)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "extractPdf")
  .addEdge("extractPdf", "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent");

export const agentGraph = graph.compile();
