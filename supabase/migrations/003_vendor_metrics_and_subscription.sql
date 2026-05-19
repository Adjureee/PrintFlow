alter table public.profiles
  add column if not exists subscription_tier public.shop_tier not null default 'standard';

alter table public.orders
  add column if not exists shop_id uuid references public.print_shops (id) on delete set null;

create index if not exists orders_shop_id_idx on public.orders (shop_id);

drop policy if exists "Authenticated users can read orders" on public.orders;

create policy "Users can read orders for their shop"
  on public.orders
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_superadmin()
    or exists (
      select 1
      from public.print_shops shops
      where shops.owner_id = auth.uid()
        and (shops.id = orders.shop_id or shops.shop_name = orders.location)
    )
  );
