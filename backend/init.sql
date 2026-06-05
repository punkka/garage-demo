CREATE TABLE IF NOT EXISTS parking_spaces (
  id SERIAL PRIMARY KEY,
  space_number INTEGER NOT NULL UNIQUE,
  is_vacant BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS parking_sessions (
  id SERIAL PRIMARY KEY,
  license_plate TEXT NOT NULL,
  space_number INTEGER NOT NULL REFERENCES parking_spaces(space_number),
  entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  price_cents INTEGER
);

INSERT INTO parking_spaces (space_number, is_vacant)
VALUES
  (1, TRUE),
  (2, TRUE),
  (3, TRUE),
  (4, TRUE),
  (5, TRUE)
ON CONFLICT (space_number) DO NOTHING;
