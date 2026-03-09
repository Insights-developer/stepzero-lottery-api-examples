# node-scope

Demonstrates the **scope parameter** of the [Stepzero](https://lotteryanalytics.app) Ask API.

The same Powerball rollover question is asked three different ways depending on which scope mode you select via the `SCOPE` environment variable. This shows how to control the analysis window — last N draws, last N days, or all available history.

## Prerequisites

- Node.js 18+ (built-in `fetch` — no polyfill needed)
- Network access to `https://lotteryanalytics.app`

No API key or authentication required.

## Setup

```bash
cd examples/node-scope
npm install
```

## Run

| Command | Scope | Question sent |
|---------|-------|---------------|
| `npm start` | Last 25 draws | "...rolled over in the last 25 draws?" |
| `SCOPE=days npm start` | Last 30 days | "...rolled over in the last 30 days?" |
| `SCOPE=all_time npm start` | All-time | "...rolled over all time?" |

```bash
# Default: last 25 draws
npm start

# Last 30 calendar days
SCOPE=days npm start

# Entire available history
SCOPE=all_time npm start
```

## Scope reference

The Stepzero Ask API supports three scope types, which the query language maps to:

| Scope type | Contract shape | Cap |
|------------|----------------|-----|
| `draws` | `{ type: 'draws', draws: N }` | max 200 |
| `days` | `{ type: 'days', days: N }` | no cap |
| `all_time` | `{ type: 'all_time' }` | all data |

Default (when no scope is provided): `{ type: 'draws', draws: 10 }`.

## Sample output

```
Scope    : last 25 draws
Question : How many times has the Powerball jackpot rolled over in the last 25 draws?
URL      : https://lotteryanalytics.app/api/v1/ask?q=How+many+times...

Answer:
For Powerball, jackpot rollover analysis over the last 25 draws: 22 of 25 draws were
rollovers, and the current rollover streak is 5.

Rollover summary:
  Draws analyzed      : 25
  Rolled (no winner)  : 22
  Hit (jackpot won)   : 3
  Current streak      : 5
  Longest streak      : 18
  Latest rollover cnt : 5

Draw-by-draw breakdown:
  Date        Jackpot ($)     Result          Status
  ----------  --------------  --------------  --------
  2026-03-06   450,000,000    12 23 34 45 56  rollover
  2026-03-04   430,000,000    07 14 21 35 42  rollover
  ...
```

## How it works

1. `resolveScope()` reads the `SCOPE` env var and returns a typed `Scope` object
2. `buildQuestion()` converts that scope into a natural language question the API can parse
3. The question is sent as `GET /api/v1/ask?q=...`
4. The structured `jackpotRolls` payload is printed as a summary + draw-by-draw table

## Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main script with full scope logic |
| `package.json` | npm scripts for each scope mode |
| `tsconfig.json` | TypeScript compiler config |
