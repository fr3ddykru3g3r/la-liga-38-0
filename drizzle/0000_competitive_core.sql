CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(length(display_name) BETWEEN 3 AND 24)
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  mode TEXT NOT NULL CHECK(mode IN ('ranked_archive','ranked_daily')),
  status TEXT NOT NULL CHECK(status IN ('drafting','ready','complete','expired')),
  formation TEXT NOT NULL,
  rating_mode TEXT NOT NULL CHECK(rating_mode IN ('season','prime')),
  seed TEXT NOT NULL,
  seed_commitment TEXT NOT NULL,
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verified_runs (
  run_id TEXT PRIMARY KEY REFERENCES runs(id),
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  mode TEXT NOT NULL,
  formation TEXT NOT NULL,
  rating_mode TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  seed TEXT NOT NULL,
  signature TEXT NOT NULL UNIQUE,
  lineup_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  points INTEGER NOT NULL CHECK(points BETWEEN 0 AND 114),
  wins INTEGER NOT NULL CHECK(wins BETWEEN 0 AND 38),
  draws INTEGER NOT NULL CHECK(draws BETWEEN 0 AND 38),
  losses INTEGER NOT NULL CHECK(losses BETWEEN 0 AND 38),
  goal_difference INTEGER NOT NULL,
  xi_rating INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(wins + draws + losses = 38),
  CHECK(points = wins * 3 + draws)
);

CREATE TABLE IF NOT EXISTS trophies (
  user_id TEXT NOT NULL REFERENCES profiles(user_id),
  trophy_id TEXT NOT NULL,
  run_id TEXT NOT NULL REFERENCES verified_runs(run_id),
  earned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id,trophy_id)
);

CREATE INDEX IF NOT EXISTS idx_verified_runs_rank ON verified_runs(mode,points DESC,wins DESC,goal_difference DESC,created_at ASC);
CREATE INDEX IF NOT EXISTS idx_verified_runs_user ON verified_runs(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runs_user_status ON runs(user_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trophies_user ON trophies(user_id,earned_at DESC);
PRAGMA optimize;
