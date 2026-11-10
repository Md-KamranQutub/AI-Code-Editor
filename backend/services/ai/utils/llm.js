import "dotenv/config";
import { ChatOpenRouter } from "@langchain/openrouter";

export const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "deepseek/deepseek-chat",
  temperature: 0,
});