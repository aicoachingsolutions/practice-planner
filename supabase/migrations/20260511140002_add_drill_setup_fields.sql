-- Add structured setup fields to drills table
-- Used by system and library drills so any coach can run them cold

alter table public.drills
  add column if not exists player_count text,
  add column if not exists equipment text,
  add column if not exists setup_instructions text,
  add column if not exists how_to_run text,
  add column if not exists coaching_points text;
