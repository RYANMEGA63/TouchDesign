// ── Database Types ───────────────────────────────────────────────
// Généré manuellement à partir du schéma SQL.
// Pour régénérer automatiquement : npx supabase gen types typescript --project-id <id>

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          price: number;
          stock: number;
          min_quantity: number;
          colors: string[];
          sizes: string[];
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      categories: {
        Row: { id: string; name: string; created_at: string; };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      product_color_images: {
        Row: { id: string; product_id: string; color_name: string; image_url: string; created_at: string; };
        Insert: Omit<Database["public"]["Tables"]["product_color_images"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["product_color_images"]["Insert"]>;
      };
      custom_order_items: {
        Row: { id: string; name: string; description: string | null; cover_image_url: string | null; sort_order: number; created_at: string; updated_at: string; };
        Insert: Omit<Database["public"]["Tables"]["custom_order_items"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["custom_order_items"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          email: string;
          product: string;
          status: "pending" | "processing" | "completed" | "cancelled";
          total: number;
          customization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      contact_messages: {
        Row: { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; created_at: string; };
        Insert: Omit<Database["public"]["Tables"]["contact_messages"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
      };
      custom_order_requests: {
        Row: {
          id: string;
          item_id: string;
          item_name: string;
          placement: string;
          notes: string | null;
          photo_urls: string[];
          status: "pending" | "processing" | "completed" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["custom_order_requests"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["custom_order_requests"]["Insert"]>;
      };

      realisations: {
        Row: {
          id: string; title: string; category: string; image_url: string;
          description: string | null; details: string | null; techniques: string[];
          created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["realisations"]["Row"], "id"|"created_at"|"updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["realisations"]["Insert"]>;
      };
      contact_info: {
        Row: { id: number; email: string; phone: string; address: string; hours: string; updated_at: string; };
        Insert: Omit<Database["public"]["Tables"]["contact_info"]["Row"], "id"|"updated_at"> & { id?: number };
        Update: Partial<Database["public"]["Tables"]["contact_info"]["Insert"]>;
      };
    };
  };
}