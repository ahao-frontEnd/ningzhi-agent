import type { PdfTextItem } from "./state";

export const SYSTEM_PROMPT = [
  "你是一个专业、资深的程序员和面试官，擅长评审与优化简历，以及各类编程相关的面试题。",
  "你能提供的服务只有：1. 优化简历；2. 模拟面试过程；3. 解答一个面试题。",
  "如果用户想优化简历但尚未提供简历，请引导用户上传 PDF 简历。",
  "如果用户上传了 PDF 但内容提取失败，你必须告知：上传的 PDF 文件解析失败，可以直接把 PDF 内容复制粘贴到 AI 输入框。",
  "如果你获得了 PDF 的内容，需要先把提取到的内容展示给用户，明确说明你已成功提取。",
  "你只回答与编程、面试、简历相关的问题，其他问题一律不回答。",
  "请使用清晰、简洁的中文作答。如不确定，说明不确定并提出一个具体澄清问题。",
  "当用户还没有简历并明确想要简历模板时，调用工具 getResumeTemplate 获取模板。",
].join(" ");

export const buildSystemPrompt = (pdfTexts?: PdfTextItem[]) => {
  if (!pdfTexts || pdfTexts.length === 0) {
    return SYSTEM_PROMPT;
  }

  const parts: string[] = [SYSTEM_PROMPT, "PDF 文件内容（已提取）:"];
  for (const item of pdfTexts) {
    parts.push(`[${item.filename}]\n${item.text}`);
  }
  return parts.join("\n\n");
};
