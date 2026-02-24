import { model } from "../model";
import { tools } from "../tools";
import { buildSystemPrompt } from "../prompt";
import { AgentState } from "../state";

const modelWithTools = model.bindTools(tools);

export const callModel = async (state: typeof AgentState.State) => {
  console.log('state.pdfTexts  ', state.pdfTexts)
  const response = await modelWithTools.invoke([
    { role: "system", content: buildSystemPrompt(state.pdfTexts) },
    ...state.messages,
  ]);
  return { messages: [response] };
};
