/**
 * langchain-js/index.ts
 * Minimal example: Stepzero wired as a LangChain DynamicTool for use with an OpenAI-backed agent.
 * Requires: npm install langchain @langchain/openai @langchain/core
 * No Stepzero API key needed.
 */
import { DynamicTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

// 1. Implement the Stepzero fetch function
async function stepzeroAsk(question: string): Promise<string> {
  const url = new URL("https://lotteryanalytics.app/api/v1/ask");
  url.searchParams.set("q", question);
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Stepzero error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return JSON.stringify(data);
}

// 2. Wrap it as a LangChain DynamicTool
const stepzeroTool = new DynamicTool({
  name: "stepzero_lottery_ask",
  description:
    "Query live and historical US lottery data (jackpots, draw results, winning numbers, stats). " +
    "Call this whenever the user asks about specific lottery jackpots, draw dates, or winning numbers. " +
    "Input: a natural-language question about lottery data.",
  func: stepzeroAsk,
});

// 3. Set up a simple OpenAI-backed agent with the tool
async function main() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  const tools = [stepzeroTool];

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful lottery assistant. When the user asks about lottery jackpots, " +
        "draw results, or winning numbers, always use the stepzero_lottery_ask tool to get real data. " +
        "Never guess lottery numbers.",
    ],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createOpenAIToolsAgent({ llm, tools, prompt });
  const executor = new AgentExecutor({ agent, tools, verbose: true });

  const result = await executor.invoke({
    input: "What is tonight's Powerball jackpot?",
  });

  console.log("\nFinal answer:", result.output);
}

main().catch(console.error);
