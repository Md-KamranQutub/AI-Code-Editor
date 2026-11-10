import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { graph } from "../graph/graph.js";

const buildHistory = (history) => {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-6)
    .filter((msg) => msg?.content && (msg.role === "user" || msg.role === "assistant"))
    .map((msg) =>
      msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );
};

const sendEvent = (res, type, data) => {
  if (res.writableEnded || res.destroyed) return false;
  try {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data ?? {})}\n\n`);
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

export const chat = async (req, res) => {
  let disconnected = false;
  const controller = new AbortController();

  try {
    const userId = req.headers["x-user-id"];
    console.log("User Id:", userId);
    const { projectId, message, history = [] } = req.body;

    if (!projectId) return res.status(400).json({ message: "Project ID is required" });
    if (!message) return res.status(400).json({ message: "Message is required" });

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    res.on("close", () => {
      if (!res.writableEnded) {
        disconnected = true;
        controller.abort();
        console.log("AI connection disconnected");
      }
    });

    sendEvent(res, "start", { success: true, message: "AI started!" });

    const graphData = graph(projectId, userId);
    const messages = buildHistory(history);
    messages.push(new HumanMessage(message));

    const stream = await graphData.stream(
      { messages },
      { streamMode: "updates", recursionLimit: 40, signal: controller.signal }
    );

    let finalMessage = "";

    for await (const chunk of stream) {
      if (chunk?.agent) {
        const assistantMessages = chunk.agent?.messages || [];
        const lastMessage = assistantMessages[assistantMessages.length - 1];
        if (!lastMessage) continue;

        if (Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length) {
          for (const call of lastMessage.tool_calls) {
            sendEvent(res, "tool_start", { tool: call.name, args: call.args || {} });
          }
          continue;
        }

        let content = "";
        if (typeof lastMessage.content === "string") {
          content = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          content = lastMessage.content
            .filter((item) => item.type === "text")
            .map((item) => item.text)
            .join("");
        }

        if (content) {
          finalMessage = content;
          sendEvent(res, "message", { content });
        }
      }

      if (chunk?.tools) {
        const toolMessages = chunk.tools?.messages || [];
        for (const toolMessage of toolMessages) {
          const raw =
            typeof toolMessage.content === "string"
              ? toolMessage.content
              : JSON.stringify(toolMessage.content);

          let result = null;
          try {
            result = JSON.parse(raw);
          } catch {
            result = null;
          }

          if (result?.operation) {
            sendEvent(res, result.operation, result);
            continue;
          }

          sendEvent(res, "tool_result", { content: raw });
        }
      }
    }

    if (!disconnected && !res.writableEnded) {
      sendEvent(res, "done", { success: true, message: finalMessage || "done" });
      res.end();
    }
  } catch (error) {
    console.error(error);
    if (disconnected) return;

    if (res.headersSent) {
      sendEvent(res, "error", { success: false, message: error?.message || "AI Request Failed" });
      if (!res.writableEnded) res.end();
      return;
    }

    return res.status(500).json({ success: false, message: error?.message || "AI Request Failed" });
  }
};