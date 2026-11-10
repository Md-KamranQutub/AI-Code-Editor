export const chat = async (projectId, message, history = [], { onEvent, signal } = {}) => {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    credentials: "include",
    signal,
    body: JSON.stringify({ projectId, message, history }),
  });

  if (!response.ok) {
    let msg = "AI request failed";
    try {
      const data = await response.json();
      msg = data?.message || msg;
    } catch {
      // response body wasn't JSON, keep the default message
    }
    throw new Error(msg);
  }

  if (!response.body) throw new Error("AI streaming not supported");

  let finalMessage = "";

  // Handles one complete SSE block ("event: x\ndata: {...}")
  const dispatch = (block) => {
    let eventType = "message";
    const dataLines = [];

    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) eventType = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }

    if (!dataLines.length) return;
    const dataText = dataLines.join("\n");

    let data;
    try {
      data = JSON.parse(dataText);
    } catch {
      data = { content: dataText };
    }

    if (eventType === "error") throw new Error(data?.message || "AI request failed");
    if (eventType === "message" && data?.content) finalMessage = data.content;

    onEvent?.(eventType, data);
  };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, "\n");

      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        if (block.trim()) dispatch(block);
      }
    }

    // flush anything left after the stream closes
    buffer += decoder.decode();
    if (buffer.trim()) dispatch(buffer.replace(/\r\n/g, "\n"));
  } finally {
    reader.releaseLock();
  }

  return finalMessage;
};