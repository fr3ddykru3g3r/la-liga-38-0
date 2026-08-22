# JORNADA // XI

An original, independent Spanish top-flight all-time XI draft and 38-match season simulator.

## Play loop

1. Choose a mode, formation, difficulty and rating lens.
2. Spin the 38-tick Jornada Dial. It samples uniformly from club-seasons that can legally fill at least one open slot.
3. Draft one eligible player-season. A real player identity can only appear once in an XI.
4. Complete the XI and inspect goalkeeper, defence, midfield, attack, balance and an expected-points band.
5. Run a seeded 38-match home-and-away campaign against 19 calibrated opponent profiles.

## Modes

- Open Archive
- Club Chronicle
- Daily Jornada
- Blind Scout
- Head-to-Head casual WebRTC room
- Ratings Atlas

## Ratings

- **Season**: an independent editorial estimate for that exact club campaign.
- **Prime**: the highest career-best value represented by the player card.
- **Legacy**: 70% best archived season, 20% second, 10% third. Sparse history repeats the available estimate.

These are fan-game ratings. They are not official La Liga, club, player-association, or video-game publisher ratings. The starter archive is intentionally compact and designed to be replaced by a sourced, versioned dataset.

## Simulation

The engine is independently authored. It combines fitted positional ratings into four lines, applies a line-balance penalty, derives home/away expected goals against 19 opponent profiles, and samples scores with a seeded Poisson model. The same XI, rating mode and seed reproduce the same 38-match ledger.

This does **not** claim to copy 38-0's undisclosed coefficients or private player database. Publicly visible genre rules informed feature parity; implementation, visual identity, rating data and coefficients are original.

## Development

```bash
npm install
npm test
npm run dev
```

Production build: `npm run build`. The app is deployable as a static Vite project on Vercel.

## Multiplayer integrity

Head-to-Head uses WebRTC data channels with deterministic shared seeds and peer validation. The room creator is the casual authority. This is deliberately labelled unranked; a ranked service should move draws, timers, ratings and simulation to an authoritative Durable Object or equivalent server.

## Accessibility and performance

- Keyboard-reachable controls and player dossiers
- Live announcements for draft state
- 44px minimum core controls
- `prefers-reduced-motion` support
- display typography waits for `document.fonts.ready`
- opening viewport is HTML/CSS-first with no image dependency

## Legal note

Independent fan project. No official league or club logos, crests, kits, player portraits, likenesses, or copied rating-provider data are included. Names and seasons are used descriptively.
