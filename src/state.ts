import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";

export type PdfTextItem = {
  filename: string;
  text: string;
};

export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  pdfTexts: Annotation<PdfTextItem[]>({
    // 在Reducer中直接使用右侧的新值，避免合并逻辑导致的重复添加问题。
    // 意思是每次提取PDF文本时，直接替换之前的 pdfTexts 数组，而不是在原有基础上添加新文本。
    reducer: (_left, right) => right,
    default: () => [],
  }),
});
