# langchain-js

Minimal TypeScript example: Stepzero lottery data wired as a **LangChain `DynamicTool`** inside an OpenAI-backed `AgentExecutor`.

The agent automatically calls `stepzero_lottery_ask` when the user asks about jackpots, draw results, or winning numbers, fetches live data from the Stepzero Ask API, and returns a natural-language answer.

## Prerequisites

- Node.js 18+
- An OpenAI API key (`OPENAI_API_KEY` env var)
- Network access to `https://lotteryanalytics.app` (no Stepzero API key needed)

## Setup

```bash
cd examples/langchain-js
npm install
```

## Run

```bash
export OPENAI_API_KEY=sk-...
npm run dev
```

## Expected output

```
> Entering new AgentExecutor chain...
> Invoking: `stepzero_lottery_ask` with 'What is tonight's Powerball jackpot?'
> ...
Final answer: Tonight's Powerball jackpot is $785 million ($382.6M cash value), with the next draw on March 11, 2026.
```

## How it works

1. `DynamicTool` wraps `stepzeroAsk()` — the `description` field tells the agent when to call it.
2. `createOpenAIToolsAgent` wires the tool into a `gpt-4o-mini` agent with a lottery-focused system prompt.
3. `AgentExecutor` runs the tool call loop automatically — no manual second-call needed (unlike the bare OpenAI/Claude examples).
4. The system prompt instructs the agent to never guess lottery numbers and to always use the tool.

## Adapting to other LangChain models

Swap `ChatOpenAI` for `ChatAnthropic` from `@langchain/anthropic` and use `createToolCallingAgent` instead of `createOpenAIToolsAgent`. The `DynamicTool` and `stepzeroAsk` function stay the same.

See the [full Stepzero AI guide](https://www.lotteryanalytics.app/guides/stepzero-for-ai-developers-and-agents) for routing logic and system prompt recommendations.
