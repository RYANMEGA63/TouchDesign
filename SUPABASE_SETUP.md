# 🚀 Guide de configuration Supabase

## 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Choisir un nom, mot de passe de base de données, région (Europe West pour l'Algérie)
3. Attendre ~2 minutes que le projet démarre

---

## 2. Créer les tables (SQL)

1. Aller dans **SQL Editor** dans le dashboard Supabase
2. Copier-coller le contenu du fichier `supabase/schema.sql`
3. Cliquer **Run** — toutes les tables, données par défaut et politiques RLS sont créées

### ⚠️ Si tu as déjà exécuté une ancienne version du schema

Des tables manquaient dans l'ancienne version. Exécute ce SQL de migration dans le SQL Editor :

```sql
-- Table réalisations (manquait)
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
alter table public.realisations enable row level security;
create policy "public_read_realisations"
  on public.realisations for select using (true);
create policy "admin_all_realisations"
  on public.realisations for all
  using ((select auth.uid()) is not null);

-- Table contact_info (manquait)
create table if not exists public.contact_info (
  id      integer primary key default 1,
  email   text not null default '',
  phone   text not null default '',
  address text not null default '',
  hours   text not null default ''
);
insert into public.contact_info (id, email, phone, address, hours)
  values (1, '', '', '', '')
on conflict (id) do nothing;
alter table public.contact_info enable row level security;
create policy "public_read_contact_info"
  on public.contact_info for select using (true);
create policy "admin_all_contact_info"
  on public.contact_info for all
  using ((select auth.uid()) is not null);

-- Correction des policies orders (suppression manquait)
drop policy if exists "admin_read_orders"   on public.orders;
drop policy if exists "admin_update_orders" on public.orders;
drop policy if exists "admin_delete_orders" on public.orders;
create policy "admin_all_orders"
  on public.orders for all
  using ((select auth.uid()) is not null);

-- Bucket realisations (manquait)
insert into storage.buckets (id, name, public)
  values ('realisations', 'realisations', true)
on conflict (id) do nothing;
create policy "public_read_realisations_storage"
  on storage.objects for select using (bucket_id = 'realisations');
create policy "admin_write_realisations_storage"
  on storage.objects for insert
  with check (bucket_id = 'realisations' and (select auth.uid()) is not null);
create policy "admin_delete_realisations_storage"
  on storage.objects for delete
  using (bucket_id = 'realisations' and (select auth.uid()) is not null);
```

---

## 3. Créer le compte admin

1. Aller dans **Authentication → Users → Add user**
2. Entrer l'email et le mot de passe de l'admin
3. Cocher **Auto Confirm User**
4. Ce sont les identifiants que l'admin utilisera sur `/admin`

---

## 4. Configurer les variables d'environnement

1. Dans le dashboard Supabase → **Settings → API**
2. Copier **Project URL** et **anon public key**
3. Renommer `.env.example` en `.env` et remplir :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Lancer le projet

```bash
npm install
npm run dev
```

---

## Structure des données

| Table | Description |
|---|---|
| `products` | Produits du catalogue (prix en DA) |
| `categories` | Catégories de produits |
| `product_color_images` | Photos par couleur (URLs Storage) |
| `custom_order_items` | Articles proposés en commande sur mesure |
| `orders` | Commandes clients |
| `contact_messages` | Messages du formulaire de contact |
| `custom_order_requests` | Demandes de commandes sur mesure |
| `realisations` | Portfolio de réalisations |
| `contact_info` | Coordonnées de l'entreprise (1 seule ligne) |

## Storage Buckets

| Bucket | Contenu | Accès |
|---|---|---|
| `products` | Photos produits + photos par couleur | Public lecture, Admin écriture |
| `custom-orders` | Photos envoyées par les clients + covers items sur mesure | Public lecture/écriture |
| `realisations` | Photos des réalisations | Public lecture, Admin écriture |
