// ── Réalisations Store — Supabase ────────────────────────────────
import { supabase, uploadImage, deleteImage } from "./supabase";

export interface Realisation {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  details?: string;
  techniques: string[];
  createdAt: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours: string;
  facebook: string;
  instagram: string;
}

// ── Row mappers ──────────────────────────────────────────────────
function rowToRealisation(r: {
  id: string; title: string; category: string; image_url: string;
  description: string | null; details: string | null;
  techniques: string[]; created_at: string;
}): Realisation {
  return {
    id: r.id, title: r.title, category: r.category, imageUrl: r.image_url,
    description: r.description ?? undefined, details: r.details ?? undefined,
    techniques: r.techniques,
    createdAt: new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  };
}

// ── Réalisations CRUD ────────────────────────────────────────────
export async function fetchRealisations(): Promise<Realisation[]> {
  const { data, error } = await supabase
    .from("realisations").select("*").order("created_at", { ascending: false });
  if (error) { console.error("[realisations] fetch:", error); return []; }
  return (data ?? []).map(rowToRealisation);
}

export async function createRealisation(
  r: Omit<Realisation, "id" | "createdAt">,
  imageFile?: File
): Promise<Realisation | null> {
  // Insert first to get id
  const { data: row, error } = await supabase
    .from("realisations")
    .insert({
      title: r.title, category: r.category,
      image_url: r.imageUrl || "https://images.unsplash.com/photo-1617804148450-ae41d0f6b94d?w=1080",
      description: r.description ?? null, details: r.details ?? null,
      techniques: r.techniques,
    })
    .select().single();
  if (error || !row) { console.error("[realisations] create:", error); return null; }

  if (imageFile) {
    const url = await uploadImage("realisations", `images/${row.id}`, imageFile);
    if (url) {
      await supabase.from("realisations").update({ image_url: url }).eq("id", row.id);
      return rowToRealisation({ ...row, image_url: url });
    }
  }
  return rowToRealisation(row);
}

export async function updateRealisation(
  id: string,
  r: Partial<Omit<Realisation, "id" | "createdAt">>,
  imageFile?: File | null
): Promise<Realisation | null> {
  let imageUrl = r.imageUrl;
  if (imageFile) {
    const url = await uploadImage("realisations", `images/${id}`, imageFile);
    if (url) imageUrl = url;
  }
  if (imageFile === null) {
    await deleteImage("realisations", `images/${id}`);
    imageUrl = undefined;
  }

  const { data: row, error } = await supabase
    .from("realisations")
    .update({
      ...(r.title !== undefined && { title: r.title }),
      ...(r.category !== undefined && { category: r.category }),
      ...(imageUrl !== undefined && { image_url: imageUrl }),
      ...(r.description !== undefined && { description: r.description ?? null }),
      ...(r.details !== undefined && { details: r.details ?? null }),
      ...(r.techniques !== undefined && { techniques: r.techniques }),
    })
    .eq("id", id).select().single();
  if (error || !row) { console.error("[realisations] update:", error); return null; }
  return rowToRealisation(row);
}

export async function deleteRealisation(id: string): Promise<boolean> {
  await deleteImage("realisations", `images/${id}`);
  const { error } = await supabase.from("realisations").delete().eq("id", id);
  if (error) { console.error("[realisations] delete:", error); return false; }
  return true;
}

// ── Contact info ─────────────────────────────────────────────────
export async function fetchContactInfo(): Promise<ContactInfo> {
  const { data, error } = await supabase.from("contact_info").select("*").eq("id", 1).single();
  if (error || !data) return { email: "", phone: "", address: "", hours: "", facebook: "", instagram: "" };
  return {
    email: data.email ?? "", phone: data.phone ?? "", address: data.address ?? "",
    hours: data.hours ?? "", facebook: data.facebook ?? "", instagram: data.instagram ?? "",
  };
}

export async function saveContactInfo(info: ContactInfo): Promise<boolean> {
  const { error } = await supabase.from("contact_info").update(info).eq("id", 1);
  if (error) { console.error("[contact_info] update:", error); return false; }
  return true;
}

// ── Custom order requests (for admin view) ───────────────────────
export interface CustomOrderRequest {
  id: string;
  itemId: string;
  itemName: string;
  customerName: string;
  phone: string;
  address: string;
  placement: string;
  notes?: string;
  photoUrls: string[];
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

export async function fetchCustomOrderRequests(): Promise<CustomOrderRequest[]> {
  const { data, error } = await supabase
    .from("custom_order_requests").select("*").order("created_at", { ascending: false });
  if (error) { console.error("[custom_order_requests] fetch:", error); return []; }
  return (data ?? []).map((r) => ({
    id: r.id, itemId: r.item_id, itemName: r.item_name,
    customerName: r.customer_name ?? "",
    phone: r.phone ?? "",
    address: r.address ?? "",
    placement: r.placement, notes: r.notes ?? undefined,
    photoUrls: r.photo_urls ?? [],
    status: r.status as CustomOrderRequest["status"],
    createdAt: new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  }));
}

export async function updateCustomOrderRequestStatus(
  id: string, status: CustomOrderRequest["status"]
): Promise<boolean> {
  const { error } = await supabase.from("custom_order_requests").update({ status }).eq("id", id);
  if (error) { console.error("[custom_order_requests] update:", error); return false; }
  return true;
}

export async function deleteCustomOrderRequest(id: string): Promise<boolean> {
  const { error } = await supabase.from("custom_order_requests").delete().eq("id", id);
  if (error) { console.error("[custom_order_requests] delete:", error); return false; }
  return true;
}
