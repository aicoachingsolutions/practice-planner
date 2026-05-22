-- Grant paid/pro access to thevach1@gmail.com
insert into public.subscriptions (user_id, plan_type, status, current_period_end)
select id, 'paid', 'active', '2099-12-31 23:59:59+00'
from auth.users
where email = 'thevach1@gmail.com'
on conflict (user_id) do update
  set plan_type = 'paid',
      status = 'active',
      current_period_end = '2099-12-31 23:59:59+00',
      updated_at = now();
