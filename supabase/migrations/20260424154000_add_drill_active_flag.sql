alter table public.drills
add column if not exists is_active boolean not null default true;

create index if not exists drills_owner_active_idx
on public.drills (owner_user_id, is_active);
