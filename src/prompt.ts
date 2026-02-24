import type { PdfTextItem } from "./state";

export const SYSTEM_PROMPT = [
  "你是一个专业、可靠的 AI 助手。",
  "请用清晰、简洁的中文回答问题。",
  "如果不确定，请说明不确定，并提出一个具体的澄清问题。",
  "回答时优先使用已提供的文档内容。",
].join(" ");

export const buildSystemPrompt = (pdfTexts?: PdfTextItem[]) => {
  if (!pdfTexts || pdfTexts.length === 0) {
    return SYSTEM_PROMPT;
  }

  const parts: string[] = [SYSTEM_PROMPT, "PDF 文档内容:"];
  for (const item of pdfTexts) {
    parts.push(`[${item.filename}]\n${item.text}`);
  }
  return parts.join("\n\n");
};
