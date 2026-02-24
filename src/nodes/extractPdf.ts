import { AgentState, PdfTextItem } from "../state";

type FileItem = {
  type?: string;
  mimeType?: string;
  data?: string;
  metadata?: { filename?: string };
};

const getPdfText = async (data: string): Promise<string> => {
  const buffer = Buffer.from(data, "base64");
  const pdfParseModule = (await import("pdf-parse")) as unknown as {
    PDFParse?: new (options: { data: Buffer }) => { getText: () => Promise<{ text: string }> };
  };
  const PDFParse = pdfParseModule.PDFParse;
  if (!PDFParse) {
    throw new Error("PDFParse export not found in pdf-parse");
  }
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
};

// 提取PDF文本的函数，遍历消息内容，识别并处理PDF文件，提取文本并更新消息内容。
export const extractPdf = async (state: typeof AgentState.State) => {
  const pdfTexts: PdfTextItem[] = [];
  // 标识是否修改了消息内容，如果没有修改且没有提取到PDF文本，则不返回messages字段，避免不必要的状态更新和模型调用。
  let changedMessages = false;

  const updatedMessages: typeof state.messages = [];
  for (const message of state.messages) {
    const content = (message as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      // 如果content不是数组，直接保留原消息内容，不进行处理。
      updatedMessages.push(message);
      continue;
    }

    let changedContent = false;
    const updatedContent: unknown[] = [];
    for (const item of content as unknown[]) {
      const fileItem = item as FileItem;
      // 如果item没有type字段或者type不是"file"，则直接保留原内容，不进行处理。
      if (fileItem?.type !== "file") {
        updatedContent.push(item);
        continue;
      }
      const filename = fileItem.metadata?.filename ?? "file.pdf";
      if (fileItem?.mimeType === "application/pdf" && fileItem.data) {
        const text = await getPdfText(fileItem.data);
        pdfTexts.push({ filename, text });
      }
      // 无论是否成功提取PDF文本，都将消息内容替换为<filename>的形式，提示模型该位置是一个PDF文件。
      changedContent = true;
      // 标记消息内容已修改，确保在有PDF文件但未成功提取文本的情况下也能触发状态更新和模型调用。
      changedMessages = true;
      updatedContent.push({ type: "text", text: `<${filename}>` });
    }

    if (changedContent) {
      (message as { content?: unknown }).content = updatedContent;
    }
    updatedMessages.push(message);
  }

  if (pdfTexts.length === 0 && !changedMessages) {
    return {};
  }

  return {
    pdfTexts,
    messages: updatedMessages,
  };
};
