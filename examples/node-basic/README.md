# node-basic

Minimal Node.js + TypeScript example for the [Stepzero](https://lotteryanalytics.app) Ask API.

Asks a natural language question about Powerball jackpot rollovers and prints both the natural language answer and the structured rollover analysis returned by the API.

## Prerequisites

- Node.js 18+ (uses the built-in `fetch` API — no polyfill needed)
- Network access to `https://lotteryanalytics.app`

No API key or authentication required.

## Setup

```bash
cd examples/node-basic
npm install
```

## Run

```bash
npm start
```

## Expected output

```
Question : How many times has the Powerball jackpot rolled over in the last 10 draws?
URL      : https://lotteryanalytics.app/api/v1/ask?q=How+many+times...

Answer:
For Powerball, jackpot rollover analysis over the last 10 draws: 8 of 10 draws were
rollovers, and the current rollover streak is 5. Peak rollover count in this window is 18.

Rollover analysis:
  hasRolloverData    : true
  drawsAnalyzed      : 10
  rolledDraws        : 8
  currentStreak      : 5
  maxRolloverCount   : 18
  latestRolloverCount: 5

  Draws:
    2026-03-06  $450,000,000  rollover  12 23 34 45 56 10
    2026-03-04  $430,000,000  rollover  ...
    ...
```

## What the code does

1. Builds a `GET /api/v1/ask?q=...` URL using the native `URL` API
2. Calls the endpoint with the built-in `fetch`
3. Parses the JSON response and prints:
   - The `answer` field (natural language summary)
   - The `jackpotRolls` payload (structured rollover stats + per-draw rows)

## Customising the question

Edit the `question` constant at the top of `src/index.ts` to ask about any game or jurisdiction supported by Stepzero:

```ts
const question = 'How many times has the Mega Millions jackpot rolled over?';
```

## Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main runnable script |
| `package.json` | npm metadata + `npm start` script |
| `tsconfig.json` | TypeScript compiler config |
