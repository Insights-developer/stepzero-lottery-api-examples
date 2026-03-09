/**
 * openai-tools/index.ts
 * Minimal example: wiring Stepzero as an OpenAI function/tool.
 * Requires: npm install openai
 * No Stepzero API key needed.
 */
import OpenAI from "openai";

const client = new OpenAI(); // uses OPENAI_API_KEY env var

// 1. Define the Stepzero tool
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "stepzero_lottery_ask",
      description:
        "Query live and historical US lottery data (jackpots, draw results, winning numbers, stats) via the Stepzero API. Call this whenever the user asks about specific lottery numbers, jackpots, or draw dates.",
      parameters: {
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

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "user", content: userMessage },
  ];

  // First call — model decides whether to use the tool
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    tools,
    tool_choice: "auto",
    messages,
  });

  const choice = response.choices[0];

  if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
    const toolCall = choice.message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments) as { question: string };
    console.log("Tool called:", args.question);

    // Execute the tool
    const toolResult = await stepzeroAsk(args.question);

    // Second call — send tool result back to the model
    const finalResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...messages,
        choice.message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        },
      ],
    });

    console.log("Assistant:", finalResponse.choices[0].message.content);
  } else {
    // Model answered without calling the tool
    console.log("Assistant:", choice.message.content);
  }
}

main().catch(console.error);
