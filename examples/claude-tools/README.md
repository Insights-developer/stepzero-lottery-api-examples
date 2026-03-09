# claude-tools

Minimal TypeScript example: Stepzero lottery data wired as a **Claude tool** (Anthropic `tool_use` API).

Claude calls `stepzero_lottery_ask` when the user asks about jackpots, draw results, or winning numbers. The tool fetches live data from the Stepzero Ask API and returns structured JSON for Claude to answer in natural language.

## Prerequisites

- Node.js 18+
- An Anthropic API key (`ANTHROPIC_API_KEY` env var)
- Network access to `https://lotteryanalytics.app` (no Stepzero API key needed)

## Setup

```bash
cd examples/claude-tools
npm install
```

## Run

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

## Expected output

```
User: What is tonight's Powerball jackpot?
Tool called: What is tonight's Powerball jackpot?
Assistant: Tonight's Powerball jackpot is $785 million ($382.6M cash value). The next draw is March 11, 2026. The last winning numbers were 05, 18, 27, 49, 62 with Powerball 24.
```

## How it works

1. User message is sent to `claude-3-5-haiku-20241022` with the `stepzero_lottery_ask` tool registered.
2. Claude returns `stop_reason: "tool_use"` when lottery data is needed.
3. `stepzeroAsk()` calls `GET /api/v1/ask?q=...` and returns structured JSON.
4. The JSON is sent back as a `tool_result` content block and Claude generates a final natural-language answer.

## Key difference from OpenAI

Claude uses `tool_use` / `tool_result` content blocks (not `function_call` / `tool` role messages). The Anthropic SDK types make this straightforward — see `index.ts` for the exact shape.

See the [full Stepzero AI guide](https://www.lotteryanalytics.app/guides/stepzero-for-ai-developers-and-agents) for routing logic and system prompt recommendations.
