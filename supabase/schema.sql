-- ================================================================
-- FLOCAGE CRÉATIF — Supabase Schema (version corrigée)
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Categories ──────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

insert into public.categories (name) values
  ('Vêtements'), ('Accessoires'), ('Décoration')
on conflict (name) do nothing;

-- ── Products ────────────────────────────────────────────────────
create table if not exists public.products (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  category         text not null,
  price            integer not null default 0,
  stock            integer not null default 0,
  min_quantity     integer not null default 1,
  colors           text[] not null default '{}',
  sizes            text[] not null default '{}',
  cover_image_url  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

insert into public.products (name, category, price, stock, min_quantity, colors, sizes) values
  ('T-Shirt Personnalisé', 'Vêtements',  2500, 150, 1, array['Blanc','Noir','Rose','Beige','Vert sauge'], array['XS','S','M','L','XL','XXL']),
  ('Sweat à Capuche',      'Vêtements',  4500,  80, 1, array['Blanc','Noir','Gris','Rose poudré','Beige'], array['XS','S','M','L','XL','XXL']),
  ('Tote Bag',             'Accessoires',1800, 200, 5, array['Naturel','Blanc','Noir','Rose','Vert'],       array['Standard']),
  ('Coussin Décoratif',    'Décoration', 3200,  50, 1, array['Blanc','Beige','Rose poudré','Vert sauge','Gris'], array['40x40cm','45x45cm','50x50cm']),
  ('Casquette',            'Accessoires',2200, 120, 1, array['Blanc','Noir','Beige','Rose','Vert'],         array['Unique']),
  ('Trousse',              'Accessoires',1500,  90, 2, array['Blanc','Rose','Beige','Vert sauge'],          array['Petite','Moyenne','Grande'])
on conflict do nothing;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Product color images ─────────────────────────────────────────
create table if not exists public.product_color_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  color_name  text not null,
  image_url   text not null,
  created_at  timestamptz not null default now(),
  unique(product_id, color_name)
);

-- ── Custom order items (admin-defined) ──────────────────────────
create table if not exists public.custom_order_items (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text,
  cover_image_url  text,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger custom_order_items_updated_at
  before update on public.custom_order_items
  for each row execute function public.set_updated_at();

insert into public.custom_order_items (name, description, sort_order) values
  ('T-Shirt',         'Coton 100%, broderie ou flocage',              0),
  ('Sweat à capuche', 'Avec ou sans zip',                             1),
  ('Tote Bag',        'Toile naturelle ou colorée',                   2),
  ('Casquette',       'Broderie sur visière ou panneau avant',        3)
on conflict do nothing;

-- ── Orders ──────────────────────────────────────────────────────
create table if not exists public.orders (
  id             uuid primary key default uuid_generate_v4(),
  customer_name  text not null,
  email          text not null,
  product        text not null,
  status         text not null default 'pending'
                 check (status in ('pending','processing','completed','cancelled')),
  total          integer not null default 0,
  customization  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

insert into public.orders (customer_name, email, product, status, total, customization, created_at) values
  ('Marie Dubois',   'marie.dubois@email.com',   'T-Shirt Personnalisé', 'pending',    35000, 'Rose - M - Broderie - Team Bride',        now() - interval '1 day'),
  ('Pierre Martin',  'pierre.martin@email.com',  'Sweat à Capuche',      'processing', 135000,'Noir - L - Flocage - Logo entreprise (×3)',now() - interval '2 days'),
  ('Sophie Laurent', 'sophie.laurent@email.com', 'Coussin Décoratif',    'completed',  42000, 'Beige - 45x45cm - Broderie - Prénom bébé',now() - interval '3 days')
on conflict do nothing;

-- ── Contact messages ─────────────────────────────────────────────
create table if not exists public.contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- ── Custom order requests ────────────────────────────────────────
create table if not exists public.custom_order_requests (
  id          uuid primary key default uuid_generate_v4(),
  item_id     text not null,
  item_name   text not null,
  placement   text not null,
  notes       text,
  photo_urls  text[] not null default '{}',
  status      text not null default 'pending'
              check (status in ('pending','processing','completed','cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger custom_order_requests_updated_at
  before update on public.custom_order_requests
  for each row execute function public.set_updated_at();

-- ── Réalisations ─────────────────────────────────────────────────
create table if not exists public.realisations (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  category    text not null,
  image_url   text not null default '',
  description text,
  details     text,
  techniques  text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger realisations_updated_at
  before update on public.realisations
  for each row execute function public.set_updated_at();

-- ── Contact info (coordonnées de l'entreprise) ────────────────────
create table if not exists public.contact_info (
  id        integer primary key default 1,
  email     text not null default '',
  phone     text not null default '',
  address   text not null default '',
  hours     text not null default '',
  facebook  text not null default '',
  instagram text not null default ''
);

insert into public.contact_info (id, email, phone, address, hours, facebook, instagram)
  values (1, '', '', '', '', '', '')
on conflict (id) do nothing;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

alter table public.categories            enable row level security;
alter table public.products              enable row level security;
alter table public.product_color_images  enable row level security;
alter table public.custom_order_items    enable row level security;
alter table public.orders                enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.custom_order_requests enable row level security;
alter table public.realisations          enable row level security;
alter table public.contact_info          enable row level security;

-- ── Lecture publique ─────────────────────────────────────────────
create policy "public_read_categories"
  on public.categories for select using (true);

create policy "public_read_products"
  on public.products for select using (true);

create policy "public_read_product_color_images"
  on public.product_color_images for select using (true);

create policy "public_read_custom_order_items"
  on public.custom_order_items for select using (true);

create policy "public_read_realisations"
  on public.realisations for select using (true);

create policy "public_read_contact_info"
  on public.contact_info for select using (true);

-- ── Écriture publique (formulaires clients) ──────────────────────
create policy "public_insert_orders"
  on public.orders for insert with check (true);

create policy "public_insert_contact"
  on public.contact_messages for insert with check (true);

create policy "public_insert_custom_requests"
  on public.custom_order_requests for insert with check (true);

-- ── Admin authentifié : accès complet ────────────────────────────
create policy "admin_all_categories"
  on public.categories for all
  using ((select auth.uid()) is not null);

create policy "admin_all_products"
  on public.products for all
  using ((select auth.uid()) is not null);

create policy "admin_all_color_images"
  on public.product_color_images for all
  using ((select auth.uid()) is not null);

create policy "admin_all_custom_order_items"
  on public.custom_order_items for all
  using ((select auth.uid()) is not null);

create policy "admin_all_orders"
  on public.orders for all
  using ((select auth.uid()) is not null);

create policy "admin_read_contact_messages"
  on public.contact_messages for select
  using ((select auth.uid()) is not null);

create policy "admin_all_custom_requests"
  on public.custom_order_requests for all
  using ((select auth.uid()) is not null);

create policy "admin_all_realisations"
  on public.realisations for all
  using ((select auth.uid()) is not null);

create policy "admin_all_contact_info"
  on public.contact_info for all
  using ((select auth.uid()) is not null);

-- ================================================================
-- STORAGE BUCKETS
-- ================================================================
insert into storage.buckets (id, name, public) values
  ('products',      'products',      true),
  ('custom-orders', 'custom-orders', true),
  ('realisations',  'realisations',  true)
on conflict (id) do nothing;

-- Bucket products
create policy "public_read_products_storage"
  on storage.objects for select using (bucket_id = 'products');

create policy "admin_write_products_storage"
  on storage.objects for insert
  with check (bucket_id = 'products' and (select auth.uid()) is not null);

create policy "admin_update_products_storage"
  on storage.objects for update
  using (bucket_id = 'products' and (select auth.uid()) is not null);

create policy "admin_delete_products_storage"
  on storage.objects for delete
  using (bucket_id = 'products' and (select auth.uid()) is not null);

-- Bucket custom-orders (clients peuvent uploader)
create policy "public_read_custom_orders_storage"
  on storage.objects for select using (bucket_id = 'custom-orders');

create policy "public_write_custom_orders_storage"
  on storage.objects for insert with check (bucket_id = 'custom-orders');

-- Bucket realisations (admin seulement)
create policy "public_read_realisations_storage"
  on storage.objects for select using (bucket_id = 'realisations');

create policy "admin_write_realisations_storage"
  on storage.objects for insert
  with check (bucket_id = 'realisations' and (select auth.uid()) is not null);

create policy "admin_update_realisations_storage"
  on storage.objects for update
  using (bucket_id = 'realisations' and (select auth.uid()) is not null);

create policy "admin_delete_realisations_storage"
  on storage.objects for delete
  using (bucket_id = 'realisations' and (select auth.uid()) is not null);
