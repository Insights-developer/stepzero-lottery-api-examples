/**
 * claude-tools/index.ts
 * Minimal example: wiring Stepzero as a Claude tool (Anthropic tool_use API).
 * Requires: npm install @anthropic-ai/sdk
 * No Stepzero API key needed.
 */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY env var

// 1. Define the Stepzero tool (Anthropic tool schema)
const tools: Anthropic.Tool[] = [
  {
    name: "stepzero_lottery_ask",
    description:
      "Query live and historical US lottery data (jackpots, draw results, winning numbers, stats) via the Stepzero API. Call this whenever the user asks about specific lottery numbers, jackpots, or draw dates. Do not guess lottery data — always call this tool.",
    input_schema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description:
            "Natural-language lottery question. Example: 'What is the current Powerball jackpot?'",
        },
      },
      required: ["question"],
    },
  },
];

// 2. Implement the tool — calls Stepzero Ask API
async function stepzeroAsk(question: string): Promise<unknown> {
  const url = new URL("https://lotteryanalytics.app/api/v1/ask");
  url.searchParams.set("q", question);
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Stepzero error: ${res.status} ${res.statusText}`);
  return res.json();
}

// 3. Run a single-turn agent loop
async function main() {
  const userMessage = "What is tonight's Powerball jackpot?";
  console.log("User:", userMessage);

  // First call — Claude decides whether to use the tool
  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    tools,
    messages: [{ role: "user", content: userMessage }],
  });

  if (response.stop_reason === "tool_use") {
    const toolUseBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    if (!toolUseBlock) throw new Error("Expected tool_use block");

    const input = toolUseBlock.input as { question: string };
    console.log("Tool called:", input.question);

    // Execute the tool
    const toolResult = await stepzeroAsk(input.question);

    // Second call — send tool result back to Claude
    const finalResponse = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      tools,
      messages: [
        { role: "user", content: userMessage },
        { role: "assistant", content: response.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUseBlock.id,
              content: JSON.stringify(toolResult),
            },
          ],
        },
      ],
    });

    const textBlock = finalResponse.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    console.log("Assistant:", textBlock?.text ?? "(no text response)");
  } else {
    // Claude answered without calling the tool
    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    console.log("Assistant:", textBlock?.text ?? "(no text response)");
  }
}

main().catch(console.error);
