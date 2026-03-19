// ── Product Store — Supabase backend ────────────────────────────
import { supabase, uploadImage, deleteImage } from "./supabase";

export interface StoredProduct {
  id: string;
  name: string;
  category: string;
  price: number;         // en DA
  stock: number;
  minQuantity: number;
  colors: string[];
  sizes: string[];
  coverImageUrl?: string; // URL Supabase Storage (ou undefined)
}

// ── Colors (constants, pas en DB) ───────────────────────────────
export const ALL_COLORS = [
  "Blanc", "Noir", "Gris", "Rose", "Rose poudré", "Beige",
  "Vert sauge", "Vert", "Bleu ciel", "Lavande", "Naturel",
  "Bordeaux", "Jaune", "Orange",
];

export const COLOR_HEX: Record<string, string> = {
  "Blanc": "#FFFFFF", "Noir": "#1a1a1a", "Gris": "#CCCCCC",
  "Rose": "#FFB5C0", "Rose poudré": "#FFB5C0", "Beige": "#F5E6D3",
  "Vert sauge": "#C8D5B9", "Vert": "#C8D5B9", "Bleu ciel": "#AED6F1",
  "Lavande": "#D7BDE2", "Naturel": "#EDD9B0", "Bordeaux": "#922B21",
  "Jaune": "#F9E79F", "Orange": "#FAD7A0",
};

// ── Row → StoredProduct ──────────────────────────────────────────
function rowToProduct(row: {
  id: string; name: string; category: string; price: number; stock: number;
  min_quantity: number; colors: string[]; sizes: string[]; cover_image_url: string | null;
}): StoredProduct {
  return {
    id: row.id, name: row.name, category: row.category,
    price: row.price, stock: row.stock, minQuantity: row.min_quantity,
    colors: row.colors, sizes: row.sizes,
    coverImageUrl: row.cover_image_url ?? undefined,
  };
}

// ── Products CRUD ────────────────────────────────────────────────
export async function fetchProducts(): Promise<StoredProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at");
  if (error) { console.error("[products] fetch:", error); return []; }
  return (data ?? []).map(rowToProduct);
}

export async function createProduct(
  p: Omit<StoredProduct, "id">,
  coverFile?: File | string
): Promise<StoredProduct | null> {
  const { data: row, error } = await supabase
    .from("products")
    .insert({
      name: p.name, category: p.category, price: p.price,
      stock: p.stock, min_quantity: p.minQuantity,
      colors: p.colors, sizes: p.sizes,
    })
    .select()
    .single();
  if (error || !row) { console.error("[products] create:", error); return null; }

  let coverUrl = p.coverImageUrl ?? null;
  if (coverFile) {
    coverUrl = await uploadImage("products", `covers/${row.id}`, coverFile);
    if (coverUrl) {
      await supabase.from("products").update({ cover_image_url: coverUrl }).eq("id", row.id);
    }
  }
  return rowToProduct({ ...row, cover_image_url: coverUrl });
}

export async function updateProduct(
  id: string,
  p: Partial<Omit<StoredProduct, "id">>,
  coverFile?: File | string | null
): Promise<StoredProduct | null> {
  let coverUrl = p.coverImageUrl;

  // Upload nouvelle couverture si fournie
  if (coverFile) {
    const uploaded = await uploadImage("products", `covers/${id}`, coverFile);
    if (uploaded) coverUrl = uploaded;
  }
  // Supprimer la couverture si explicitement null
  if (coverFile === null) {
    await deleteImage("products", `covers/${id}`);
    coverUrl = undefined;
  }

  const { data: row, error } = await supabase
    .from("products")
    .update({
      ...(p.name !== undefined && { name: p.name }),
      ...(p.category !== undefined && { category: p.category }),
      ...(p.price !== undefined && { price: p.price }),
      ...(p.stock !== undefined && { stock: p.stock }),
      ...(p.minQuantity !== undefined && { min_quantity: p.minQuantity }),
      ...(p.colors !== undefined && { colors: p.colors }),
      ...(p.sizes !== undefined && { sizes: p.sizes }),
      cover_image_url: coverUrl ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !row) { console.error("[products] update:", error); return null; }
  return rowToProduct(row);
}

export async function deleteProduct(id: string): Promise<boolean> {
  await deleteImage("products", `covers/${id}`);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) { console.error("[products] delete:", error); return false; }
  return true;
}

// ── Categories CRUD ──────────────────────────────────────────────
export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("created_at");
  if (error) { console.error("[categories] fetch:", error); return []; }
  return (data ?? []).map((r) => r.name);
}

export async function addCategory(name: string): Promise<boolean> {
  const { error } = await supabase.from("categories").insert({ name });
  if (error) { console.error("[categories] add:", error); return false; }
  return true;
}

export async function renameCategory(oldName: string, newName: string): Promise<boolean> {
  const { error: catErr } = await supabase
    .from("categories")
    .update({ name: newName })
    .eq("name", oldName);
  if (catErr) { console.error("[categories] rename:", catErr); return false; }
  // Update all products in that category
  await supabase.from("products").update({ category: newName }).eq("category", oldName);
  return true;
}

export async function deleteCategory(name: string): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("name", name);
  if (error) { console.error("[categories] delete:", error); return false; }
  return true;
}

// ── Color images CRUD ────────────────────────────────────────────
export async function fetchColorImages(productId: string): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("product_color_images")
    .select("color_name, image_url")
    .eq("product_id", productId);
  if (error) { console.error("[color_images] fetch:", error); return {}; }
  const result: Record<string, string> = {};
  (data ?? []).forEach((r) => { result[r.color_name] = r.image_url; });
  return result;
}

export async function setColorImage(
  productId: string,
  colorName: string,
  file: File | string
): Promise<string | null> {
  const path = `color-images/${productId}/${colorName.toLowerCase().replace(/\s/g, "_")}`;
  const url = await uploadImage("products", path, file);
  if (!url) return null;

  const { error } = await supabase
    .from("product_color_images")
    .upsert({ product_id: productId, color_name: colorName, image_url: url },
             { onConflict: "product_id,color_name" });
  if (error) { console.error("[color_images] upsert:", error); return null; }
  return url;
}

export async function removeColorImage(productId: string, colorName: string): Promise<void> {
  const path = `color-images/${productId}/${colorName.toLowerCase().replace(/\s/g, "_")}`;
  await deleteImage("products", path);
  await supabase
    .from("product_color_images")
    .delete()
    .eq("product_id", productId)
    .eq("color_name", colorName);
}

// ── Orders CRUD ──────────────────────────────────────────────────
export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  orderType: "commande" | "sur-mesure" | "mix";
  status: "pending" | "processing" | "completed" | "cancelled";
  date: string;
  total: number;
  customization: string;
}

function rowToOrder(row: {
  id: string; customer_name: string; email: string; phone: string | null;
  address: string | null; product: string; order_type: string | null;
  status: string; total: number; customization: string | null; created_at: string;
}): Order {
  return {
    id: row.id, customerName: row.customer_name, email: row.email,
    phone: row.phone ?? "", address: row.address ?? "",
    product: row.product,
    orderType: (row.order_type as Order["orderType"]) ?? "commande",
    status: row.status as Order["status"],
    total: row.total, customization: row.customization ?? "",
    date: new Date(row.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[orders] fetch:", error); return []; }
  return (data ?? []).map(rowToOrder);
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<boolean> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) { console.error("[orders] update:", error); return false; }
  return true;
}

export async function createOrder(order: Omit<Order, "id" | "date">): Promise<boolean> {
  const payload: Record<string, unknown> = {
    customer_name: order.customerName, email: order.email,
    phone: order.phone || null, address: order.address || null,
    product: order.product,
    order_type: order.orderType,
    status: order.status,
    total: order.total, customization: order.customization || null,
  };

  const { error } = await supabase.from("orders").insert(payload);

  // Si la colonne order_type n'existe pas encore, réessayer sans elle
  if (error) {
    if (error.message?.includes("order_type") || error.code === "42703") {
      const { order_type, ...payloadWithout } = payload;
      const { error: error2 } = await supabase.from("orders").insert(payloadWithout);
      if (error2) { console.error("[orders] create:", error2); return false; }
      return true;
    }
    console.error("[orders] create:", error);
    return false;
  }
  return true;
}

// ── Contact messages ─────────────────────────────────────────────
export async function submitContactMessage(msg: {
  name: string; email: string; phone?: string; subject?: string; message: string;
}): Promise<boolean> {
  const { error } = await supabase.from("contact_messages").insert({
    name: msg.name, email: msg.email,
    phone: msg.phone ?? null, subject: msg.subject ?? null,
    message: msg.message,
  });
  if (error) { console.error("[contact] insert:", error); return false; }
  return true;
}

// ── Custom order requests ────────────────────────────────────────
export async function submitCustomOrderRequest(req: {
  itemId: string; itemName: string; placement: string; notes?: string; photos: File[];
  customerName?: string; phone?: string; address?: string;
}): Promise<boolean> {
  // Upload all photos first
  const photoUrls: string[] = [];
  for (let i = 0; i < req.photos.length; i++) {
    const url = await uploadImage("custom-orders", `requests/${Date.now()}_${i}`, req.photos[i]);
    if (url) photoUrls.push(url);
  }

  const { error } = await supabase.from("custom_order_requests").insert({
    item_id: req.itemId, item_name: req.itemName,
    placement: req.placement, notes: req.notes ?? null,
    photo_urls: photoUrls,
    customer_name: req.customerName ?? null,
    phone: req.phone ?? null,
    address: req.address ?? null,
  });
  if (error) { console.error("[custom_orders] insert:", error); return false; }
  return true;
}

// ── Utility ──────────────────────────────────────────────────────
export function formatDA(price: number): string {
  return `${price.toLocaleString("fr-DZ")} DA`;
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function deleteOrder(id: string): Promise<boolean> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) { console.error("[orders] delete:", error); return false; }
  return true;
}
