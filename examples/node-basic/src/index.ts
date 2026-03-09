// Stepzero Ask API - Node + TypeScript basic example
// Endpoint: GET /api/v1/ask?q=<natural language question>
// No authentication required.
// Requires Node.js 18+ (built-in fetch).

const API_BASE = 'https://lotteryanalytics.app';

// ---------------------------------------------------------------
// Types matching the /api/v1/ask jackpot_rolls response shape
// ---------------------------------------------------------------

type JackpotRolloverRow = {
  draw_id: number;
  draw_date: string;      // "YYYY-MM-DD"
  draw_time: string;      // "HH:MM"
  result: string;         // e.g. "12 23 34 45 56 10"
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
// Main
// ---------------------------------------------------------------

async function main(): Promise<void> {
  const question =
    'How many times has the Powerball jackpot rolled over in the last 10 draws?';

  const url = new URL('/api/v1/ask', API_BASE);
  url.searchParams.set('q', question);

  console.log('Question :', question);
  console.log('URL      :', url.toString());
  console.log();

  const res = await fetch(url.toString());

  if (!res.ok) {
    const text = await res.text();
    console.error(`Stepzero error ${res.status}: ${text}`);
    process.exit(1);
  }

  const data = (await res.json()) as AskResponse;

  // Print the natural language answer
  console.log('Answer:');
  console.log(data.answer ?? '(no answer field on this response)');
  console.log();

  // Print the structured rollover analysis if present
  if (data.jackpotRolls) {
    const j = data.jackpotRolls;
    console.log('Rollover analysis:');
    console.log('  hasRolloverData   :', j.hasRolloverData);
    console.log('  drawsAnalyzed     :', j.drawsAnalyzed);
    console.log('  rolledDraws       :', j.rolledDraws);
    console.log('  currentStreak     :', j.currentStreak);
    console.log('  maxRolloverCount  :', j.maxRolloverCount);
    console.log('  latestRolloverCount:', j.latestRolloverCount);
    console.log();
    console.log('  Draws:');
    for (const row of j.rows) {
      const hit = row.was_jackpot_hit ? 'HIT' : 'rollover';
      console.log(
        `    ${row.draw_date}  $${row.jackpot_amount.toLocaleString()}  ${hit}  ${row.result}`
      );
    }
  } else {
    console.log('(no jackpotRolls payload - intent may differ)');
    console.log();
    console.dir(data, { depth: null });
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
