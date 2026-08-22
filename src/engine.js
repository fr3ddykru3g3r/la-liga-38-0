import { opponentProfiles, positionFamily } from './data.js';

export function hashSeed(input) {
  let h = 2166136261;
  for (let i = 0; i < String(input).length; i++) {
    h ^= String(input).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rngFrom(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function fitFor(player, slot) {
  const index = player.positions.indexOf(slot);
  if (index === 0) return 1;
  if (index === 1) return 0.98;
  if (index > 1) return 0.96;
  const family = positionFamily(slot);
  if (player.positions.some(p => positionFamily(p) === family)) return 0.91;
  return 0;
}

export function effectiveRating(player, slot, ratingMode = 'season') {
  return Math.round((ratingMode === 'prime' ? player.prime : player.rating) * fitFor(player, slot));
}

export function eligibleForSlot(player, slot, draftedPlayerIds = []) {
  return !draftedPlayerIds.includes(player.playerId) && fitFor(player, slot) > 0;
}

export function legalClubSeasons(players, openSlots, draftedPlayerIds = [], filters = {}) {
  const pool = new Map();
  for (const p of players) {
    if (filters.club && p.club !== filters.club) continue;
    if (filters.minYear && Number(p.season.slice(0,4)) < filters.minYear) continue;
    if (!openSlots.some(slot => eligibleForSlot(p, slot, draftedPlayerIds))) continue;
    const key = `${p.club}|${p.season}`;
    if (!pool.has(key)) pool.set(key, { club: p.club, season: p.season, players: [] });
    pool.get(key).players.push(p);
  }
  return [...pool.values()];
}

export function spinClubSeason(players, openSlots, draftedPlayerIds, filters, random) {
  const pool = legalClubSeasons(players, openSlots, draftedPlayerIds, filters);
  if (!pool.length) return null;
  return { result: pool[Math.floor(random() * pool.length)], poolSize: pool.length };
}

export function teamLines(lineup, ratingMode = 'season') {
  const groups = { gk: [], def: [], mid: [], att: [] };
  for (const pick of lineup) groups[positionFamily(pick.slot)].push(effectiveRating(pick.player, pick.slot, ratingMode));
  const mean = xs => xs.length ? xs.reduce((a,b) => a+b, 0) / xs.length : 60;
  const lines = { goalkeeping: mean(groups.gk), defence: mean(groups.def), midfield: mean(groups.mid), attack: mean(groups.att) };
  const values = Object.values(lines);
  const balance = Math.min(...values);
  lines.overall = 0.12 * lines.goalkeeping + 0.29 * lines.defence + 0.30 * lines.midfield + 0.29 * lines.attack;
  lines.balance = balance;
  return Object.fromEntries(Object.entries(lines).map(([k,v]) => [k, Math.round(v * 10) / 10]));
}

export function poisson(lambda, random) {
  const limit = Math.exp(-Math.max(0.01, lambda));
  let product = 1, count = 0;
  do { count += 1; product *= random(); } while (product > limit && count < 14);
  return count - 1;
}

export function expectedMatch(lines, opponent, home) {
  const homeEdge = home ? 0.10 : -0.10;
  const balancePenalty = Math.max(0, lines.overall - lines.balance) * 0.012;
  const forLog = Math.log(1.34) + 0.019 * (lines.attack - opponent.defence) + 0.007 * (lines.midfield - opponent.midfield) - balancePenalty + homeEdge;
  const againstLog = Math.log(1.05) + 0.018 * (opponent.attack - lines.defence) + 0.006 * (opponent.midfield - lines.midfield) - 0.006 * (lines.goalkeeping - 82) - homeEdge;
  return { xgFor: Math.max(0.18, Math.min(4.4, Math.exp(forLog))), xgAgainst: Math.max(0.12, Math.min(3.8, Math.exp(againstLog))) };
}

export function expectedPointsBand(lines) {
  const score = lines.overall + Math.max(-4, (lines.balance - 82) * 0.3);
  const centre = Math.round(Math.max(44, Math.min(108, 58 + (score - 76) * 2.15)));
  return [Math.max(34, centre - 9), Math.min(114, centre + 9)];
}

export function simulateSeason(lineup, ratingMode = 'season', seed = Date.now()) {
  if (lineup.length !== 11) throw new Error('A complete XI is required');
  const random = rngFrom(seed);
  const lines = teamLines(lineup, ratingMode);
  const schedule = opponentProfiles.flatMap(opponent => [{ opponent, home: true }, { opponent, home: false }]);
  for (let i = schedule.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [schedule[i], schedule[j]] = [schedule[j], schedule[i]]; }
  const stats = new Map(lineup.map(p => [p.player.playerId, { player: p.player, goals: 0, assists: 0, cleanSheets: 0, ratingPoints: 0 }]));
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  const attackers = lineup.filter(p => positionFamily(p.slot) === 'att' || p.slot === 'CAM');
  const creators = lineup.filter(p => positionFamily(p.slot) !== 'gk');
  const weightedPick = list => {
    const weights = list.map(p => Math.max(1, effectiveRating(p.player, p.slot, ratingMode) - 68));
    let roll = random() * weights.reduce((a,b) => a+b, 0);
    for (let i = 0; i < list.length; i++) { roll -= weights[i]; if (roll <= 0) return list[i]; }
    return list.at(-1);
  };
  const matches = schedule.map(({ opponent, home }, index) => {
    const { xgFor, xgAgainst } = expectedMatch(lines, opponent, home);
    const shared = poisson(0.08, random);
    const gf = poisson(Math.max(0.05, xgFor - 0.08), random) + shared;
    const ga = poisson(Math.max(0.05, xgAgainst - 0.08), random) + shared;
    goalsFor += gf; goalsAgainst += ga;
    const result = gf > ga ? 'W' : gf === ga ? 'D' : 'L';
    if (result === 'W') wins++; else if (result === 'D') draws++; else losses++;
    for (let g = 0; g < gf; g++) {
      const scorerPick = weightedPick(attackers.length ? attackers : creators);
      stats.get(scorerPick.player.playerId).goals++;
      if (random() < 0.72) {
        const assistPick = weightedPick(creators.filter(p => p.player.playerId !== scorerPick.player.playerId));
        if (assistPick) stats.get(assistPick.player.playerId).assists++;
      }
    }
    if (ga === 0) lineup.forEach(p => stats.get(p.player.playerId).cleanSheets++);
    lineup.forEach(p => stats.get(p.player.playerId).ratingPoints += 5.8 + random() * 1.8 + (result === 'W' ? .55 : result === 'D' ? .2 : 0));
    return { jornada: index + 1, opponent: opponent.name, home, goalsFor: gf, goalsAgainst: ga, result, xgFor: +xgFor.toFixed(2), xgAgainst: +xgAgainst.toFixed(2) };
  });
  const points = wins * 3 + draws;
  const playerStats = [...stats.values()].map(s => ({ ...s, average: +(s.ratingPoints / 38).toFixed(2) })).sort((a,b) => (b.goals + b.assists * .7) - (a.goals + a.assists * .7));
  return {
    seed: String(seed), lines, matches, playerStats, wins, draws, losses, goalsFor, goalsAgainst, points,
    finish: points >= 86 ? 1 : points >= 76 ? 2 : points >= 68 ? 4 : points >= 59 ? 6 : points >= 50 ? 9 : points >= 42 ? 14 : 18,
    goldenBoot: [...playerStats].sort((a,b) => b.goals - a.goals)[0],
    playerOfSeason: playerStats[0]
  };
}

export function legacyRating(playerId, allPlayers) {
  const seasons = allPlayers.filter(p => p.playerId === playerId).map(p => p.rating).sort((a,b) => b-a);
  if (!seasons.length) return null;
  return Math.round(seasons[0] * .7 + (seasons[1] ?? seasons[0]) * .2 + (seasons[2] ?? seasons.at(-1)) * .1);
}
