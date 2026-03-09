# openai-tools

Minimal TypeScript example: Stepzero lottery data wired as an **OpenAI function/tool** (tool-calling API).

The model calls `stepzero_lottery_ask` when the user asks about jackpots, draw results, or winning numbers. The tool fetches live data from the Stepzero Ask API and feeds it back to the model to answer in natural language.

## Prerequisites

- Node.js 18+
- An OpenAI API key (`OPENAI_API_KEY` env var)
- Network access to `https://lotteryanalytics.app` (no Stepzero API key needed)

## Setup

```bash
cd examples/openai-tools
npm install
```

## Run

```bash
export OPENAI_API_KEY=sk-...
npm run dev
```

## Expected output

```
User: What is tonight's Powerball jackpot?
Tool called: What is tonight's Powerball jackpot?
Assistant: Tonight's Powerball jackpot is $785 million ($382.6M cash value). The next draw is March 11, 2026. The last draw was March 8 with numbers 05, 18, 27, 49, 62 and Powerball 24.
```

## How it works

1. User message is sent to `gpt-4o-mini` with the `stepzero_lottery_ask` tool registered.
2. The model returns a `tool_calls` finish reason when lottery data is needed.
3. `stepzeroAsk()` calls `GET /api/v1/ask?q=...` and returns structured JSON.
4. The JSON is appended as a `tool` message and the model generates a final natural-language answer.

See the [full Stepzero AI guide](https://www.lotteryanalytics.app/guides/stepzero-for-ai-developers-and-agents) for routing logic and system prompt recommendations.
