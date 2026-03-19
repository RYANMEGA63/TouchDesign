// ── Custom Order Items Store — Supabase backend ──────────────────
import { supabase, uploadImage, deleteImage } from "./supabase";

export interface CustomOrderItem {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  sortOrder: number;
  price: number; // en DA
}

function rowToItem(row: {
  id: string; name: string; description: string | null;
  cover_image_url: string | null; sort_order: number; price: number | null;
}): CustomOrderItem {
  return {
    id: row.id, name: row.name,
    description: row.description ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    sortOrder: row.sort_order,
    price: row.price ?? 0,
  };
}

export async function fetchCustomOrderItems(): Promise<CustomOrderItem[]> {
  const { data, error } = await supabase
    .from("custom_order_items")
    .select("*")
    .order("sort_order");
  if (error) { console.error("[custom_order_items] fetch:", error); return []; }
  return (data ?? []).map(rowToItem);
}

export async function createCustomOrderItem(
  item: Omit<CustomOrderItem, "id">,
  coverFile?: File | string
): Promise<CustomOrderItem | null> {
  const { data: row, error } = await supabase
    .from("custom_order_items")
    .insert({
      name: item.name,
      description: item.description ?? null,
      sort_order: item.sortOrder,
      price: item.price ?? 0,
    })
    .select()
    .single();
  if (error || !row) { console.error("[custom_order_items] create:", error); return null; }

  let coverUrl: string | null = null;
  if (coverFile) {
    coverUrl = await uploadImage("custom-orders", `covers/${row.id}`, coverFile);
    if (coverUrl) {
      await supabase.from("custom_order_items").update({ cover_image_url: coverUrl }).eq("id", row.id);
    }
  }
  return rowToItem({ ...row, cover_image_url: coverUrl });
}

export async function updateCustomOrderItem(
  id: string,
  item: Partial<Omit<CustomOrderItem, "id">>,
  coverFile?: File | string | null
): Promise<CustomOrderItem | null> {
  let coverUrl = item.coverImageUrl ?? undefined;

  if (coverFile) {
    const uploaded = await uploadImage("custom-orders", `covers/${id}`, coverFile);
    if (uploaded) coverUrl = uploaded;
  }
  if (coverFile === null) {
    await deleteImage("custom-orders", `covers/${id}`);
    coverUrl = undefined;
  }

  const { data: row, error } = await supabase
    .from("custom_order_items")
    .update({
      ...(item.name !== undefined && { name: item.name }),
      ...(item.description !== undefined && { description: item.description ?? null }),
      ...(item.sortOrder !== undefined && { sort_order: item.sortOrder }),
      ...(item.price !== undefined && { price: item.price }),
      cover_image_url: coverUrl ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !row) { console.error("[custom_order_items] update:", error); return null; }
  return rowToItem(row);
}

export async function deleteCustomOrderItem(id: string): Promise<boolean> {
  await deleteImage("custom-orders", `covers/${id}`);
  const { error } = await supabase.from("custom_order_items").delete().eq("id", id);
  if (error) { console.error("[custom_order_items] delete:", error); return false; }
  return true;
}
