// Turns mileage totals into relatable "fun facts". Returns all applicable
// facts; the UI picks one at random (and can shuffle).

import { StravaStatsData } from '../data/strava';

const EQUATOR = 24901; // mi around the Earth
const MOON = 238855; // mi to the Moon
const NYC_LA = 2448; // mi NYC -> LA
const USA_COAST = 2800; // mi coast to coast
const GREAT_WALL = 13171; // mi
const MARATHON = 26.2;
const FIVE_K = 3.107;
const TDF = 2200; // Tour de France ~ mi
const CHANNEL = 21; // English Channel ~ mi
const POOL_LEN = 0.0310686; // 50 m in mi

const n = (x: number, d = 1) => x.toLocaleString(undefined, { maximumFractionDigits: d });

export function buildFunFacts(stats: StravaStatsData): string[] {
  const run = stats.totalRun;
  const bike = stats.totalBike;
  const swim = stats.totalSwim;
  const overall = run + bike + swim;

  const facts: string[] = [];

  if (overall > 0) {
    facts.push(`Across all sports you've covered ${n(overall, 0)} mi — that's ${n((overall / EQUATOR) * 100)}% of a lap around the Earth 🌍`);
    facts.push(`Your ${n(overall, 0)} total miles ≈ ${n(overall / NYC_LA)}× the trip from New York to Los Angeles 🗺️`);
    facts.push(`You're ${n((overall / MOON) * 100, 2)}% of the way to the Moon 🌙`);
    facts.push(`Laid end to end, your miles cover ${n((overall / GREAT_WALL) * 100)}% of the Great Wall of China 🧱`);
  }
  if (run > 2) {
    facts.push(`You've run the equivalent of ${n(run / MARATHON)} marathons 🏃`);
    facts.push(`That's ${n(Math.floor(run / FIVE_K), 0)} parkruns (5K) worth of running 🏃‍♂️`);
    facts.push(`Your running alone would stretch ${n((run / USA_COAST) * 100)}% across the USA 🇺🇸`);
  }
  if (bike > 5) {
    facts.push(`On the bike you've ridden ${n(bike / TDF)} Tours de France 🚴`);
    facts.push(`Your cycling covers ${n((bike / EQUATOR) * 100)}% of the equator 🌍`);
    facts.push(`That's ${n(bike / USA_COAST)} coast-to-coast USA crossings by bike 🚴‍♂️`);
  }
  if (swim > 0.2) {
    facts.push(`You've swum ${n(swim / CHANNEL)} English Channels 🏊`);
    facts.push(`That's about ${n(Math.round(swim / POOL_LEN), 0)} lengths of an Olympic pool 🏊‍♀️`);
  }

  return facts;
}
