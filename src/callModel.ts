import { MessagesAnnotation } from "@langchain/langgraph";
import { model } from "./model";
import { tools } from "./tools";
import { SYSTEM_PROMPT } from "./prompt";

const modelWithTools = model.bindTools(tools);
// 打印PDF文本内容的函数
const logPdfText = async (messages: typeof MessagesAnnotation.State["messages"]) => {
  // 遍历消息，查找包含文件的消息
  for (const message of messages) {
    const content = (message as { content?: unknown }).content;
    // content 可能是字符串，也可能是数组，如果不是数组则跳过
    if (!Array.isArray(content)) continue;
    // 遍历内容项，查找文件项， content 是一个数组，可能包含文本和文件项
    for (const item of content) {
      const fileItem = item as {
        type?: string; // 文件项的类型，应该是 "file"
        mimeType?: string; // 文件的 MIME 类型，例如 "application/pdf"
        data?: string; // 文件数据，应该是 base64 编码的字符串
        metadata?: { filename?: string }; // 文件的元数据，可能包含文件名等信息
      };
      if (fileItem.type !== "file") continue;
      if (fileItem.mimeType !== "application/pdf") continue;
      if (!fileItem.data) continue;
      // 解析 PDF 文件内容, Buffer.from 将 base64 字符串转换为二进制数据，pdf-parse 模块用于解析 PDF 文件并提取文本内容
      const buffer = Buffer.from(fileItem.data, "base64");
      // 动态导入 pdf-parse 模块，获取 PDFParse 类，并使用它来解析 PDF 文件内容并提取文本
      const pdfParseModule = (await import("pdf-parse")) as unknown as {
        PDFParse?: new (options: { data: Buffer }) => { getText: () => Promise<{ text: string }> };
      };
      const PDFParse = pdfParseModule.PDFParse;
      if (!PDFParse) {
        throw new Error("PDFParse export not found in pdf-parse");
      }
      // 创建 PDFParse 实例并调用 getText 方法来提取 PDF 文件的文本内容，最后将提取的文本打印到控制台
      const parser = new PDFParse({ data: buffer });
      // getText 方法返回一个 Promise，解析完成后会得到一个包含文本内容的对象，我们从中提取文本并打印出来
      const result = await parser.getText();
      console.log(result.text);
    }
  }
};

// 调用模型的函数，首先调用 logPdfText 函数来打印 PDF 文件的文本内容，然后使用 modelWithTools 调用模型并传入系统提示和消息，最后返回模型的响应作为新的消息状态
export const callModel = async (state: typeof MessagesAnnotation.State) => {
  await logPdfText(state.messages);
  const response = await modelWithTools.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    ...state.messages,
  ]);
  // 将模型的响应封装成一个新的消息对象，并返回一个新的状态，其中包含这个响应消息, 作为消息数组的一部分，供后续的图状态转换使用
  return { messages: [response] };
};
