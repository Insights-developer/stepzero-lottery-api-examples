// Stepzero Ask API - scope parameter example
//
// Demonstrates all three scope modes:
//   draws    -> last N draws  (default: 10, max: 200)
//   days     -> last N calendar days
//   all_time -> entire available history
//
// Control which scope runs via the SCOPE env var:
//   npm start              -> draws (last 25)
//   SCOPE=days npm start   -> days  (last 30)
//   SCOPE=all_time npm start -> all available data
//
// Requires Node.js 18+ (built-in fetch). No auth required.

const API_BASE = 'https://lotteryanalytics.app';

// ---------------------------------------------------------------
// Scope types (mirrors the API contract exactly)
// ---------------------------------------------------------------

type ScopeDraws   = { type: 'draws';    draws: number };
type ScopeDays    = { type: 'days';     days: number  };
type ScopeAllTime = { type: 'all_time'               };
type Scope = ScopeDraws | ScopeDays | ScopeAllTime;

// ---------------------------------------------------------------
// Response types
// ---------------------------------------------------------------

type JackpotRolloverRow = {
  draw_id: number;
  draw_date: string;
  draw_time: string;
  result: string;
  jackpot_amount: number;
  was_jackpot_hit: boolean;
};

type JackpotRolloverAnalysis = {
  hasRolloverData: boolean;
  drawsAnalyzed: number;
  rolledDraws: number;
  currentStreak: number | null;
  maxRolloverCount: number | null;
  latestRolloverCount: number | null;
  rows: JackpotRolloverRow[];
};

type AskResponse = {
  answer?: string;
  intent?: string;
  jackpotRolls?: JackpotRolloverAnalysis;
};

// ---------------------------------------------------------------
// Build a human-readable label for the active scope
// ---------------------------------------------------------------

function describeScope(scope: Scope): string {
  switch (scope.type) {
    case 'draws':    return `last ${scope.draws} draws`;
    case 'days':     return `last ${scope.days} days`;
    case 'all_time': return 'all-time';
  }
}

// ---------------------------------------------------------------
// Resolve scope from SCOPE env var
// ---------------------------------------------------------------

function resolveScope(): Scope {
  const mode = (process.env.SCOPE ?? 'draws').toLowerCase();
  switch (mode) {
    case 'days':     return { type: 'days',     days:  30 };
    case 'all_time': return { type: 'all_time'            };
    default:         return { type: 'draws',    draws: 25 };
  }
}

// ---------------------------------------------------------------
// Build the query string that encodes the scope
// The Ask API reads scope intent from the natural language question.
// We embed it directly so the server can resolve it unambiguously.
// ---------------------------------------------------------------

function buildQuestion(scope: Scope): string {
  switch (scope.type) {
    case 'draws':
      return `How many times has the Powerball jackpot rolled over in the last ${scope.draws} draws?`;
    case 'days':
      return `How many times has the Powerball jackpot rolled over in the last ${scope.days} days?`;
    case 'all_time':
      return 'How many times has the Powerball jackpot rolled over all time?';
  }
}

// ---------------------------------------------------------------
// Main
// ---------------------------------------------------------------

async function main(): Promise<void> {
  const scope    = resolveScope();
  const question = buildQuestion(scope);

  const url = new URL('/api/v1/ask', API_BASE);
  url.searchParams.set('q', question);

  console.log(`Scope    : ${describeScope(scope)}`);
  console.log(`Question : ${question}`);
  console.log(`URL      : ${url.toString()}`);
  console.log();

  const res = await fetch(url.toString());

  if (!res.ok) {
    const text = await res.text();
    console.error(`Stepzero error ${res.status}: ${text}`);
    process.exit(1);
  }

  const data = (await res.json()) as AskResponse;

  console.log('Answer:');
  console.log(data.answer ?? '(no answer field on this response)');
  console.log();

  if (data.jackpotRolls) {
    const j = data.jackpotRolls;

    if (!j.hasRolloverData) {
      console.log('No rollover data available for this game / scope.');
      return;
    }

    console.log('Rollover summary:');
    console.log(`  Draws analyzed      : ${j.drawsAnalyzed}`);
    console.log(`  Rolled (no winner)  : ${j.rolledDraws}`);
    console.log(`  Hit (jackpot won)   : ${j.drawsAnalyzed - j.rolledDraws}`);
    console.log(`  Current streak      : ${j.currentStreak ?? 'n/a'}`);
    console.log(`  Longest streak      : ${j.maxRolloverCount ?? 'n/a'}`);
    console.log(`  Latest rollover cnt : ${j.latestRolloverCount ?? 'n/a'}`);
    console.log();

    console.log('Draw-by-draw breakdown:');
    console.log('  Date        Jackpot ($)     Result          Status');
    console.log('  ----------  --------------  --------------  --------');
    for (const row of j.rows) {
      const jackpot = row.jackpot_amount.toLocaleString().padStart(14);
      const result  = row.result.padEnd(14);
      const status  = row.was_jackpot_hit ? 'HIT' : 'rollover';
      console.log(`  ${row.draw_date}  ${jackpot}  ${result}  ${status}`);
    }
  } else {
    console.log('(no jackpotRolls payload returned)');
    console.dir(data, { depth: null });
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
