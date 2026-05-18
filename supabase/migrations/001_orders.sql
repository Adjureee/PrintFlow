-- PrintFlow orders table (run in Supabase SQL editor)
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  student_name text not null,
  student_id text not null,
  file_name text not null,
  file_url text,
  cloudinary_public_id text,
  location text not null,
  settings jsonb not null default '{}'::jsonb,
  gcash_ref_number text not null,
  total_amount numeric(10, 2) not null,
  status text not null default 'awaiting-verification',
  claim_code text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

create policy "Authenticated users can read orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Users can insert their own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own orders"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
