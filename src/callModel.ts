import { MessagesAnnotation } from "@langchain/langgraph";
import { model } from "./model";
import { tools } from "./tools";
import { SYSTEM_PROMPT } from "./prompt";

const modelWithTools = model.bindTools(tools);

export const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await modelWithTools.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    ...state.messages,
  ]);
  return { messages: [response] };
};
