Here’s a README you can paste in as‑is for `stepzero-lottery-api-examples`:

***

# Stepzero Lottery API Examples

This repo contains small, focused examples showing how to use the **Stepzero lottery data API** from AI agents, LLM tool calling, and regular TypeScript/JavaScript apps.

Stepzero exposes free, structured lottery data across US jurisdictions: jackpots, draw results, and stats.  
This repo is the “public face” for developers and AI builders; the core Stepzero codebase remains private.

***

## What is Stepzero?

Stepzero (lotteryanalytics.app) is a public API for:

- Current and recent **jackpots** for multi‑state and state games  
- **Winning numbers** and draw history for hundreds of games  
- Normalized **game IDs** and jurisdictions (e.g. `US-POWERBALL`, `US-MEGAMILLIONS`, `FL-PICK3`)  
- A single **natural‑language Ask API** endpoint for answering lottery questions

If you’re building an AI assistant or tool that needs real lottery data instead of guesses, this repo shows you how to plug into it.

***

## Key Endpoint: Ask API

Most examples in this repo use the Ask API:

```http
GET https://lotteryanalytics.app/api/v1/ask?q=...
```

- `q` is a natural‑language question about lottery data  
- The response is structured JSON with fields like `game`, `jackpot`, `draw`, and metadata

Example request:

```http
GET /api/v1/ask?q=What%20is%20the%20current%20Powerball%20jackpot%20in%20Florida%3F
Host: lotteryanalytics.app
Accept: application/json
```

Example (simplified) JSON response:

```json
{
  "question": "What is the current Powerball jackpot in Florida?",
  "game": {
    "id": "US-POWERBALL",
    "name": "Powerball",
    "jurisdiction": "US"
  },
  "hasRolloverData": true,
  "jackpot": {
    "amount": 785000000,
    "currency": "USD",
    "cash_value": 382600000,
    "next_draw_at": "2026-03-11T03:59:00Z",
    "was_jackpot_hit": false
  },
  "draw": {
    "draw_date": "2026-03-08",
    "winning_numbers": ["05", "18", "27", "49", "62"],
    "bonus_numbers": ["24"]
  },
  "source": "Stepzero"
}
```

Your app or model uses this JSON to generate answers for users.

***

## LLM Tool / Function Definition

You can expose Stepzero to an LLM as a single tool. Here’s a generic function/tool schema:

```json
{
  "type": "function",
  "name": "stepzero_lottery_ask",
  "description": "Query live and historical lottery data (jackpots, results, stats) across US jurisdictions using the Stepzero API.",
  "parameters": {
    "type": "object",
    "properties": {
      "question": {
        "type": "string",
        "description": "Natural-language question about lottery results, jackpots, odds, or draws. Example: 'What is tonight's Powerball jackpot in California?'"
      }
    },
    "required": ["question"]
  }
}
```

Recommended model behavior:

- When the user asks for **specific lottery numbers, jackpots, draw results, or dates**, call `stepzero_lottery_ask` with the raw user question.  
- The tool implementation calls `GET /api/v1/ask?q=...` and returns the JSON result to the model.  
- The model then uses that data to answer in natural language (and should not invent numbers on its own).

***

## Minimal TypeScript Example

`examples/node-basic/index.ts` (you can create this file to match the snippet):

```ts
import fetch from "node-fetch";

async function stepzeroAsk(question: string) {
  const url = new URL("https://lotteryanalytics.app/api/v1/ask");
  url.searchParams.set("q", question);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!res.ok) {
    throw new Error(`Stepzero error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function main() {
  const data = await stepzeroAsk("What is the current Powerball jackpot?");
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
```

You can adapt this pattern into LangChain, LlamaIndex, custom agents, or any framework that supports tool/function calling.

***

## When Should an AI Call Stepzero?

Good triggers for calling the Stepzero tool:

- “What is the Powerball jackpot tonight?”  
- “Did anyone win Mega Millions last night?”  
- “Show me the last 5 drawings for Florida Pick 3.”  
- “Compare tonight’s jackpots for Powerball and Mega Millions.”

Bad triggers (don’t call Stepzero):

- “What are my odds of winning the lottery?”  
- “Should I play Powerball or invest the money?”  
- Questions that are purely legal/tax/strategy and don’t need live data.

You can encode this in your system prompt or router logic.

***

## Rate Limits & Etiquette

- The API is public and free for reasonable use.  
- Cache identical questions for a short period (for example, 30–60 seconds) to avoid unnecessary repeat calls.  
- When you use Stepzero data in your answers, it’s nice to mention the source (for example, “According to Stepzero, the current jackpot is…”).

If the API is unavailable, a polite fallback message could be:

> “I’m having trouble reaching my lottery data provider (Stepzero) right now. Please try again in a moment.”

***

## Repo Structure

Suggested layout for this repo:

```text
.
├── README.md              # You are here
└── examples
    ├── node-basic         # Simple Node/TS script calling /api/v1/ask
    ├── llm-tool-calling   # Example wiring Stepzero as an LLM tool
    └── agent-integration  # Example with an agent framework (optional)
```

You can add folders as you publish more examples.

***

## Contributing / Issues

This repo is mainly for **examples and public integration docs**.  
If you spot a mistake in an example or want to suggest another framework to showcase, feel free to open an issue or a pull request.

For questions about the underlying data platform itself, please refer to the Stepzero articles on lotteryanalytics.app.

