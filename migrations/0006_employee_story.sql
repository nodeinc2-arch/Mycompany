-- Pay.ca persistence — employee persona/story fields (Cloudflare D1 / SQLite).
--
-- Adds narrative texture to the employees table (backs the "story for each
-- user" surface): hire date, a one-line story, a home-office flag (drives the
-- T2200 at year-end), and dated life events stored as a JSON array. All
-- nullable and additive — existing rows and code are unaffected.

ALTER TABLE employees ADD COLUMN start_date     TEXT;
ALTER TABLE employees ADD COLUMN story          TEXT;
ALTER TABLE employees ADD COLUMN works_from_home INTEGER;  -- 0/1, nullable
ALTER TABLE employees ADD COLUMN life_events    TEXT;       -- JSON array of {date,kind,note}
