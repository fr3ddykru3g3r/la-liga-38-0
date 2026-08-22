# La Liga XI

An original, independent Spanish top-flight all-time XI draft and 38-match season simulator.

## Play loop

1. Choose a mode, formation, difficulty and rating lens.
2. Spin the 38-tick Matchday Dial. It samples uniformly from club-seasons that can legally fill at least one open slot.
3. Draft one eligible player-season. A real player identity can only appear once in an XI.
4. Complete the XI and inspect goalkeeper, defence, midfield, attack, balance and an expected-points band.
5. Run a seeded 38-match home-and-away campaign against 19 calibrated opponent profiles.

## Modes

- Open Archive
- Club Chronicle
- Daily Draft
- Ranked Run (server-authoritative draws, picks, simulation and signed result)
- Blind Scout
- Head-to-Head casual WebRTC room
- Ratings Atlas

## Ratings

- **Season**: an independent editorial estimate for that exact club campaign.
- **Prime**: the highest career-best value represented by the player card.
- **Legacy**: 70% best archived season, 20% second, 10% third. Sparse history repeats the available estimate.

These are fan-game ratings. They are not official La Liga, club, player-association, or video-game publisher ratings. The current 6,104-card archive covers 19 clubs across 32 season labels, but remains partial and editorial; it is not represented as a complete or statistically sourced history. `data/sources.json` records the evidence and licensing status honestly.

## Simulation

The engine is independently authored. It combines fitted positional ratings into four lines, applies a line-balance penalty, derives home/away expected goals against 19 opponent profiles, and samples scores with a seeded Poisson model. The same XI, rating mode and seed reproduce the same 38-match ledger.

Historical calibration targets are generated from 5,000+ CC0 Spanish top-flight match results pinned to an OpenFootball commit. Run `npm run calibrate -- /path/to/openfootball-espana` to reproduce `data/calibration/openfootball-summary.json`. Automated tests enforce source/license metadata, home advantage, draw-rate bounds and strength monotonicity.

This does **not** claim to copy 38-0's undisclosed coefficients or private player database. Publicly visible genre rules informed feature parity; implementation, visual identity, rating data and coefficients are original.

## Development

```bash
npm install
npm test
npm run dev
```

Production build: `npm run build`. The app is deployable as a static Vite project on Vercel.

## Multiplayer integrity

Head-to-Head uses WebRTC data channels with deterministic shared seeds and peer validation. It remains explicitly casual and unranked. Ranked Run is separate: the Sites Worker issues every draw, validates each pick against its canonical card catalogue, simulates the season, stores the result in D1, awards trophies and exposes only server-generated results to the leaderboard.

## Competitive integrity

- ChatGPT-authenticated profiles; guest casual play remains available
- Server-derived seed and pre-run seed commitment
- Optimistic run versions reject stale or concurrent actions
- Canonical server-side player, position and duplicate-identity validation
- Signed result receipts and server-only leaderboard writes
- D1-backed profiles, authoritative runs, trophy cabinet and ranked table
- Same-origin write protection and request-size limits

The runtime deliberately reports authoritative live multiplayer as unavailable until the host provides a serialized room primitive such as Durable Objects. The peer room is never promoted into ranked play.

## Accessibility and performance

- Keyboard-reachable controls and player dossiers
- Live announcements for draft state
- 44px minimum core controls
- `prefers-reduced-motion` support
- display typography waits for `document.fonts.ready`
- opening viewport is HTML/CSS-first with no image dependency

## Legal note

Independent fan project. No official league or club logos, crests, kits, player portraits, likenesses, or copied rating-provider data are included. Names and seasons are used descriptively.
