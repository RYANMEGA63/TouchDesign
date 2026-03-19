import { useState, useRef, useEffect, useCallback } from "react";
import {
  Package, ShoppingBag, TrendingUp, Plus, Edit, Trash2, Eye,
  Camera, X, Check, Tag, ImagePlus, Sparkles, LogOut, ShieldCheck, Loader2,
  Image, Phone,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import {
  fetchProducts, createProduct, updateProduct, deleteProduct as deleteProductDB,
  fetchCategories, addCategory, renameCategory as renameCategoryDB, deleteCategory as deleteCategoryDB,
  fetchColorImages, setColorImage as setColorImageDB, removeColorImage as removeColorImageDB,
  fetchOrders, updateOrderStatus as updateOrderStatusDB, deleteOrder as deleteOrderDB,
  Order, StoredProduct, COLOR_HEX, ALL_COLORS, formatDA, fileToDataUrl,
} from "../productStore";
import {
  fetchCustomOrderItems, createCustomOrderItem, updateCustomOrderItem, deleteCustomOrderItem,
  CustomOrderItem,
} from "../customOrderStore";
import {
  fetchRealisations, createRealisation, updateRealisation, deleteRealisation, Realisation,
  fetchContactInfo, saveContactInfo, ContactInfo,
} from "../realisationsStore";
import { AdminLogin } from "./AdminLogin";
import { isAuthenticated, onAuthChange, logout, startActivityWatcher } from "../adminAuth";
import { uploadImage } from "../supabase";

// ══════════════════════════════════════════════════════════════════
export function Admin() {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const unsub = onAuthChange(setAuthed);
    return unsub;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setAuthed(false);
    toast.success("Déconnecté.");
  }, []);

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
}

// ══════════════════════════════════════════════════════════════════
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [loading, setLoading] = useState(true);

  // ── Data ──────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<CustomOrderItem[]>([]);
  const [colorImages, setColorImagesState] = useState<Record<string, Record<string, string>>>({});
  const [selectedPhotoProductId, setSelectedPhotoProductId] = useState<string>("");
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ email: "", phone: "", address: "", hours: "", facebook: "", instagram: "" });


  // ── Load all data ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, c, o, ci, r, ci2] = await Promise.all([
        fetchProducts(), fetchCategories(), fetchOrders(), fetchCustomOrderItems(),
        fetchRealisations(), fetchContactInfo(),
      ]);
      setProducts(p); setCategories(c); setOrders(o); setCustomItems(ci);
      setRealisations(r); setContactInfo(ci2);
      if (p.length > 0) setSelectedPhotoProductId(p[0].id);
      setLoading(false);
    })();
  }, []);

  // Load color images when product selection changes
  useEffect(() => {
    if (!selectedPhotoProductId) return;
    fetchColorImages(selectedPhotoProductId).then((imgs) => {
      setColorImagesState((prev) => ({ ...prev, [selectedPhotoProductId]: imgs }));
    });
  }, [selectedPhotoProductId]);

  // ── Order helpers ─────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleUpdateOrderStatus = async (id: string, status: Order["status"]) => {
    const ok = await updateOrderStatusDB(id, status);
    if (!ok) { toast.error("Erreur lors de la mise à jour"); return; }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    setSelectedOrder((prev) => prev?.id === id ? { ...prev, status } : prev);
    toast.success("Statut mis à jour");
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Supprimer définitivement cette commande ?")) return;
    const ok = await deleteOrderDB(id);
    if (ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
      toast.success("Commande supprimée.");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const map: Record<Order["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "En attente" },
      processing: { variant: "default", label: "En cours" },
      completed: { variant: "outline", label: "Terminée" },
      cancelled: { variant: "destructive", label: "Annulée" },
    };
    const c = map[status];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  // ── Product form ──────────────────────────────────────────────
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoredProduct | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "", category: "", price: 0, stock: 0, minQuantity: 1,
    sizes: "", colors: [] as string[],
    coverImageUrl: undefined as string | undefined,
    coverFile: undefined as File | null | undefined,
  });
  const coverInputRef = useRef<HTMLInputElement>(null);

  const openProductDialog = (product?: StoredProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name, category: product.category, price: product.price,
        stock: product.stock, minQuantity: product.minQuantity ?? 1,
        sizes: product.sizes.join(", "), colors: [...product.colors],
        coverImageUrl: product.coverImageUrl, coverFile: undefined,
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", category: "", price: 0, stock: 0, minQuantity: 1, sizes: "", colors: [], coverImageUrl: undefined, coverFile: undefined });
    }
    setIsProductDialogOpen(true);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProductForm((prev) => ({ ...prev, coverFile: file, coverImageUrl: preview }));
    e.target.value = "";
  };

  const toggleColor = (color: string) => {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter((c) => c !== color) : [...prev.colors, color],
    }));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category) { toast.error("Nom et catégorie sont obligatoires"); return; }
    if (productForm.colors.length === 0) { toast.error("Choisissez au moins une couleur"); return; }
    const sizesArr = productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean);
    if (sizesArr.length === 0) { toast.error("Ajoutez au moins une taille"); return; }

    setSavingProduct(true);
    if (editingProduct) {
      const updated = await updateProduct(
        editingProduct.id,
        { name: productForm.name, category: productForm.category, price: productForm.price,
          stock: productForm.stock, minQuantity: productForm.minQuantity,
          sizes: sizesArr, colors: productForm.colors },
        productForm.coverFile === null ? null : productForm.coverFile
      );
      if (updated) {
        setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        toast.success("Produit mis à jour !");
      } else toast.error("Erreur lors de la mise à jour");
    } else {
      const created = await createProduct(
        { name: productForm.name, category: productForm.category, price: productForm.price,
          stock: productForm.stock, minQuantity: productForm.minQuantity,
          sizes: sizesArr, colors: productForm.colors },
        productForm.coverFile ?? undefined
      );
      if (created) {
        setProducts((prev) => [...prev, created]);
        toast.success("Produit ajouté !");
      } else toast.error("Erreur lors de la création");
    }
    setSavingProduct(false);
    setIsProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const ok = await deleteProductDB(id);
    if (ok) { setProducts((prev) => prev.filter((p) => p.id !== id)); toast.success("Produit supprimé."); }
    else toast.error("Erreur lors de la suppression");
  };

  // ── Category helpers ──────────────────────────────────────────
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<{ index: number; value: string } | null>(null);

  const handleAddCategory = async () => {
    const name = newCatName.trim();
    if (!name) { toast.error("Nom vide"); return; }
    if (categories.includes(name)) { toast.error("Catégorie déjà existante"); return; }
    const ok = await addCategory(name);
    if (ok) { setCategories((prev) => [...prev, name]); setNewCatName(""); toast.success(`"${name}" ajoutée !`); }
    else toast.error("Erreur");
  };

  const handleRenameCategory = async () => {
    if (!editingCat) return;
    const name = editingCat.value.trim();
    if (!name) { toast.error("Nom vide"); return; }
    const oldName = categories[editingCat.index];
    const ok = await renameCategoryDB(oldName, name);
    if (ok) {
      setCategories((prev) => prev.map((c, i) => i === editingCat.index ? name : c));
      setProducts((prev) => prev.map((p) => p.category === oldName ? { ...p, category: name } : p));
      setEditingCat(null);
      toast.success("Renommée !");
    } else toast.error("Erreur");
  };

  const handleDeleteCategory = async (cat: string) => {
    if (products.some((p) => p.category === cat)) { toast.error(`Des produits utilisent "${cat}"`); return; }
    const ok = await deleteCategoryDB(cat);
    if (ok) { setCategories((prev) => prev.filter((c) => c !== cat)); toast.success(`"${cat}" supprimée.`); }
    else toast.error("Erreur");
  };

  // ── Color images ──────────────────────────────────────────────
  const [uploadTarget, setUploadTarget] = useState<{ productId: string; colorName: string } | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const url = await setColorImageDB(uploadTarget.productId, uploadTarget.colorName, file);
    if (url) {
      setColorImagesState((prev) => ({
        ...prev,
        [uploadTarget.productId]: { ...(prev[uploadTarget.productId] ?? {}), [uploadTarget.colorName]: url },
      }));
      toast.success(`Photo "${uploadTarget.colorName}" mise à jour.`);
    } else toast.error("Erreur upload");
    setUploadTarget(null);
    e.target.value = "";
  };

  const handleRemoveColorImage = async (productId: string, colorName: string) => {
    await removeColorImageDB(productId, colorName);
    setColorImagesState((prev) => {
      const next = { ...prev, [productId]: { ...(prev[productId] ?? {}) } };
      delete next[productId][colorName];
      return next;
    });
    toast.success("Photo supprimée.");
  };

  const triggerUpload = (productId: string, colorName: string) => {
    setUploadTarget({ productId, colorName });
    setTimeout(() => imgInputRef.current?.click(), 50);
  };

  // ── Custom items ──────────────────────────────────────────────
  const [isCustomItemDialogOpen, setIsCustomItemDialogOpen] = useState(false);
  const [savingCustomItem, setSavingCustomItem] = useState(false);
  const [customItemForm, setCustomItemForm] = useState<{
    id: string | null; name: string; description: string; price: number;
    coverImageUrl?: string; coverFile?: File | null;
  }>({ id: null, name: "", description: "", price: 0, coverImageUrl: undefined, coverFile: undefined });
  const customItemCoverRef = useRef<HTMLInputElement>(null);

  const openCustomItemDialog = (item?: CustomOrderItem) => {
    if (item) {
      setCustomItemForm({ id: item.id, name: item.name, description: item.description ?? "", price: item.price ?? 0, coverImageUrl: item.coverImageUrl, coverFile: undefined });
    } else {
      setCustomItemForm({ id: null, name: "", description: "", price: 0, coverImageUrl: undefined, coverFile: undefined });
    }
    setIsCustomItemDialogOpen(true);
  };

  const handleCustomItemCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomItemForm((prev) => ({ ...prev, coverFile: file, coverImageUrl: URL.createObjectURL(file) }));
    e.target.value = "";
  };

  const handleCustomItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemForm.name.trim()) { toast.error("Nom obligatoire"); return; }
    setSavingCustomItem(true);

    if (customItemForm.id) {
      const updated = await updateCustomOrderItem(
        customItemForm.id,
        { name: customItemForm.name.trim(), description: customItemForm.description.trim() || undefined, price: customItemForm.price },
        customItemForm.coverFile === null ? null : customItemForm.coverFile
      );
      if (updated) {
        setCustomItems((prev) => prev.map((i) => i.id === updated.id ? updated : i));
        toast.success("Article mis à jour !");
      } else toast.error("Erreur");
    } else {
      const created = await createCustomOrderItem(
        { name: customItemForm.name.trim(), description: customItemForm.description.trim() || undefined, sortOrder: customItems.length, price: customItemForm.price },
        customItemForm.coverFile ?? undefined
      );
      if (created) {
        setCustomItems((prev) => [...prev, created]);
        toast.success("Article ajouté !");
      } else toast.error("Erreur");
    }
    setSavingCustomItem(false);
    setIsCustomItemDialogOpen(false);
  };

  const handleDeleteCustomItem = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const ok = await deleteCustomOrderItem(id);
    if (ok) { setCustomItems((prev) => prev.filter((i) => i.id !== id)); toast.success("Supprimé."); }
    else toast.error("Erreur");
  };

  // ── Réalisations ──────────────────────────────────────────────
  const [isRealisationDialogOpen, setIsRealisationDialogOpen] = useState(false);
  const [editingRealisation, setEditingRealisation] = useState<Realisation | null>(null);
  const [savingRealisation, setSavingRealisation] = useState(false);
  const [realisationForm, setRealisationForm] = useState({
    title: "", category: "", description: "", details: "", techniques: "",
    imageUrl: "", imageFile: undefined as File | null | undefined,
  });
  const realisationImgRef = useRef<HTMLInputElement>(null);

  const openRealisationDialog = (r?: Realisation) => {
    if (r) {
      setEditingRealisation(r);
      setRealisationForm({ title: r.title, category: r.category, description: r.description ?? "",
        details: r.details ?? "", techniques: r.techniques.join(", "), imageUrl: r.imageUrl, imageFile: undefined });
    } else {
      setEditingRealisation(null);
      setRealisationForm({ title: "", category: "", description: "", details: "", techniques: "", imageUrl: "", imageFile: undefined });
    }
    setIsRealisationDialogOpen(true);
  };

  const handleRealisationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRealisationForm((prev) => ({ ...prev, imageFile: file, imageUrl: URL.createObjectURL(file) }));
    e.target.value = "";
  };

  const handleRealisationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realisationForm.title || !realisationForm.category) { toast.error("Titre et catégorie obligatoires"); return; }
    setSavingRealisation(true);
    const techArr = realisationForm.techniques.split(",").map((t) => t.trim()).filter(Boolean);
    if (editingRealisation) {
      const updated = await updateRealisation(editingRealisation.id,
        { title: realisationForm.title, category: realisationForm.category,
          description: realisationForm.description || undefined, details: realisationForm.details || undefined,
          techniques: techArr, imageUrl: realisationForm.imageUrl },
        realisationForm.imageFile === null ? null : realisationForm.imageFile);
      if (updated) { setRealisations((prev) => prev.map((r) => r.id === updated.id ? updated : r)); toast.success("Réalisation mise à jour !"); }
      else toast.error("Erreur");
    } else {
      const created = await createRealisation(
        { title: realisationForm.title, category: realisationForm.category,
          description: realisationForm.description || undefined, details: realisationForm.details || undefined,
          techniques: techArr, imageUrl: realisationForm.imageUrl },
        realisationForm.imageFile ?? undefined);
      if (created) { setRealisations((prev) => [created, ...prev]); toast.success("Réalisation ajoutée !"); }
      else toast.error("Erreur");
    }
    setSavingRealisation(false);
    setIsRealisationDialogOpen(false);
  };

  const handleDeleteRealisation = async (id: string) => {
    if (!confirm("Supprimer cette réalisation ?")) return;
    const ok = await deleteRealisation(id);
    if (ok) { setRealisations((prev) => prev.filter((r) => r.id !== id)); toast.success("Supprimée."); }
    else toast.error("Erreur");
  };

  // ── Contact info ──────────────────────────────────────────────
  const [savingContact, setSavingContact] = useState(false);
  const handleSaveContact = async () => {
    setSavingContact(true);
    const ok = await saveContactInfo(contactInfo);
    setSavingContact(false);
    if (ok) toast.success("Coordonnées mises à jour !");
    else toast.error("Erreur lors de la sauvegarde");
  };

  // ── Stats ──────────────────────────────────────────────────────
  const totalRevenu = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;
  const stats = [
    { icon: ShoppingBag, label: "Commandes", value: orders.length, color: "from-primary to-accent" },
    { icon: Package, label: "Produits", value: products.length, color: "from-secondary to-primary" },
    { icon: TrendingUp, label: "Revenu", value: formatDA(totalRevenu), color: "from-accent to-secondary" },
  ];

  const selectedPhotoProduct = products.find((p) => p.id === selectedPhotoProductId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Chargement du tableau de bord…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-14 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground">Admin</h1>
            </div>
            <p className="text-muted-foreground text-sm">Gérez vos produits, catégories et commandes</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex-shrink-0 rounded-full gap-2 text-sm">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Se déconnecter</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-3 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{stat.label}</p>
                    <p className="text-xl sm:text-3xl font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="orders" className="space-y-4 sm:space-y-6">
          <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1 overflow-x-auto">
            <TabsTrigger value="orders" className="relative">
              Commandes
              {pendingOrders > 0 && (
                <span className="ml-1.5 bg-destructive text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                  {pendingOrders}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="custom">Sur mesure</TabsTrigger>
            <TabsTrigger value="realisations">Réalisations</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="history" className="text-muted-foreground">Historique</TabsTrigger>
          </TabsList>

          {/* ── Orders (actives seulement : pending + processing) ── */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Type","Client","Articles","Date","Montant","Statut","Actions"].map((h) => (
                        <th key={h} className="px-5 py-4 text-left text-sm font-medium text-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.filter(o => o.status === "pending" || o.status === "processing").map((order) => {
                      const firstLine = order.product.split("\n")[0].replace("[SUR MESURE] ", "").split(" | ")[0];
                      const lineCount = order.product.split("\n").length;
                      const typeBadge = {
                        "commande":   <Badge variant="outline" className="text-xs whitespace-nowrap">Commande</Badge>,
                        "sur-mesure": <Badge className="text-xs whitespace-nowrap bg-primary/10 text-primary border border-primary/20">Sur mesure</Badge>,
                        "mix":        <Badge className="text-xs whitespace-nowrap bg-accent/20 text-foreground border border-accent/30">Mix</Badge>,
                      }[order.orderType] ?? <Badge variant="outline" className="text-xs">Commande</Badge>;
                      return (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-4">{typeBadge}</td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.phone || order.email}</p>
                          </td>
                          <td className="px-5 py-4 max-w-[200px]">
                            <p className="text-sm truncate">{firstLine}</p>
                            {lineCount > 1 && <p className="text-xs text-muted-foreground">+{lineCount - 1} article(s)</p>}
                          </td>
                          <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{order.date}</td>
                          <td className="px-5 py-4 text-sm font-medium text-primary whitespace-nowrap">{order.total > 0 ? formatDA(order.total) : "À confirmer"}</td>
                          <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.filter(o => o.status === "pending" || o.status === "processing").length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        Aucune commande en cours. Les commandes terminées sont dans l'onglet Historique.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ── Historique (terminées + annulées) ── */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground">Commandes terminées et annulées — archivées automatiquement.</p>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Type","Client","Articles","Date","Montant","Statut","Actions"].map((h) => (
                        <th key={h} className="px-5 py-4 text-left text-sm font-medium text-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.filter(o => o.status === "completed" || o.status === "cancelled").map((order) => {
                      const firstLine = order.product.split("\n")[0].replace("[SUR MESURE] ", "").split(" | ")[0];
                      const lineCount = order.product.split("\n").length;
                      const typeBadge = {
                        "commande":   <Badge variant="outline" className="text-xs whitespace-nowrap">Commande</Badge>,
                        "sur-mesure": <Badge className="text-xs whitespace-nowrap bg-primary/10 text-primary border border-primary/20">Sur mesure</Badge>,
                        "mix":        <Badge className="text-xs whitespace-nowrap bg-accent/20 text-foreground border border-accent/30">Mix</Badge>,
                      }[order.orderType] ?? <Badge variant="outline" className="text-xs">Commande</Badge>;
                      return (
                        <tr key={order.id} className={`transition-colors ${order.status === "cancelled" ? "opacity-60" : ""} hover:bg-muted/30`}>
                          <td className="px-5 py-4">{typeBadge}</td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.phone || order.email}</p>
                          </td>
                          <td className="px-5 py-4 max-w-[200px]">
                            <p className="text-sm truncate">{firstLine}</p>
                            {lineCount > 1 && <p className="text-xs text-muted-foreground">+{lineCount - 1} article(s)</p>}
                          </td>
                          <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{order.date}</td>
                          <td className="px-5 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">{order.total > 0 ? formatDA(order.total) : "—"}</td>
                          <td className="px-5 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.filter(o => o.status === "completed" || o.status === "cancelled").length === 0 && (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">Aucune commande archivée pour l'instant.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ── Products ── */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => openProductDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                <Plus className="w-4 h-4 mr-2" />Ajouter un produit
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.coverImageUrl ? (
                    <div className="h-40 overflow-hidden">
                      <img src={product.coverImageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                      <ImagePlus className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg font-semibold mb-0.5 truncate">{product.name}</h3>
                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button size="sm" variant="ghost" onClick={() => openProductDialog(product)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {product.colors.map((c) => (
                        <div key={c} title={c} className="w-5 h-5 rounded-full border"
                          style={{ backgroundColor: COLOR_HEX[c] ?? "#ddd", borderColor: COLOR_HEX[c] === "#FFFFFF" ? "#e0e0e0" : "transparent" }} />
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prix :</span>
                        <span className="text-lg font-bold text-primary">{formatDA(product.price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Qté min. :</span>
                        <span className="text-sm font-medium">{product.minQuantity} pièce{product.minQuantity > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stock :</span>
                        <Badge variant={product.stock > 50 ? "outline" : "destructive"}>{product.stock} unités</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Photos ── */}
          <TabsContent value="photos" className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Photos par couleur</h2>
              <p className="text-sm text-muted-foreground">Stockées dans Supabase Storage — les clients voient la vraie photo à la sélection.</p>
            </div>
            <input ref={imgInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleColorImageUpload} />
            <div className="flex flex-wrap gap-2">
              {products.map((p) => {
                const count = Object.keys(colorImages[p.id] ?? {}).length;
                const active = selectedPhotoProductId === p.id;
                return (
                  <button key={p.id} type="button" onClick={() => setSelectedPhotoProductId(p.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all flex items-center gap-2 ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    {p.name}
                    {count > 0 && (
                      <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                        {count}/{p.colors.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedPhotoProduct ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {selectedPhotoProduct.colors.map((colorName) => {
                  const hex = COLOR_HEX[colorName] ?? "#DDDDDD";
                  const img = colorImages[selectedPhotoProduct.id]?.[colorName];
                  return (
                    <div key={colorName} className="space-y-2">
                      <div className="aspect-square rounded-xl overflow-hidden border border-border relative group bg-muted/20">
                        {img ? (
                          <>
                            <img src={img} alt={colorName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-1.5">
                              <button type="button" className="bg-white text-foreground rounded-full p-1.5"
                                onClick={() => triggerUpload(selectedPhotoProduct.id, colorName)}><Camera className="w-3.5 h-3.5" /></button>
                              <button type="button" className="bg-red-500 text-white rounded-full p-1.5"
                                onClick={() => handleRemoveColorImage(selectedPhotoProduct.id, colorName)}><X className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: hex }} />
                          </>
                        ) : (
                          <button type="button" className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-muted/40 transition-colors"
                            onClick={() => triggerUpload(selectedPhotoProduct.id, colorName)}>
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: hex, border: hex === "#FFFFFF" ? "1px solid #e0e0e0" : "none" }} />
                            </div>
                            <Camera className="w-4 h-4 text-muted-foreground/40" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-center text-muted-foreground truncate">{colorName}</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-8">Aucun produit.</p>}
          </TabsContent>

          {/* ── Categories ── */}
          <TabsContent value="categories" className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Gestion des catégories</h2>
              <p className="text-sm text-muted-foreground">Ajoutez, renommez ou supprimez les catégories.</p>
            </div>
            <Card className="p-5">
              <Label className="mb-2 block">Nouvelle catégorie</Label>
              <div className="flex gap-3">
                <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Entreprises, Événements…"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                  className="flex-1" />
                <Button onClick={handleAddCategory} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
                  <Plus className="w-4 h-4 mr-1" />Ajouter
                </Button>
              </div>
            </Card>
            <div className="space-y-2">
              {categories.map((cat, i) => {
                const count = products.filter((p) => p.category === cat).length;
                const isEditing = editingCat?.index === i;
                return (
                  <Card key={cat + i} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    {isEditing ? (
                      <Input value={editingCat.value} onChange={(e) => setEditingCat({ ...editingCat, value: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRenameCategory(); if (e.key === "Escape") setEditingCat(null); }}
                        className="flex-1 h-8" autoFocus />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{cat}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{count} produit{count !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                    <div className="flex gap-1 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={handleRenameCategory} className="text-green-600"><Check className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCat(null)}><X className="w-4 h-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingCat({ index: i, value: cat })}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(cat)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Sur mesure ── */}
          <TabsContent value="custom" className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />Commandes sur mesure
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Définissez librement les types de produits proposés à la personnalisation.
                </p>
              </div>
              <Button onClick={() => openCustomItemDialog()} className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                <Plus className="w-4 h-4 mr-2" />Ajouter
              </Button>
            </div>
            {customItems.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Aucun article configuré.<br />Cliquez sur "Ajouter" pour commencer.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden flex flex-col">
                    {item.coverImageUrl ? (
                      <div className="h-36 overflow-hidden">
                        <img src={item.coverImageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.name}</h3>
                          {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                          {item.price > 0 && (
                            <p className="text-sm font-bold text-primary mt-1">{formatDA(item.price)}</p>
                          )}
                          {item.price === 0 && (
                            <p className="text-xs text-muted-foreground mt-1 italic">Prix non défini</p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => openCustomItemDialog(item)}><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCustomItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Réalisations ── */}
          <TabsContent value="realisations" className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2"><Image className="w-5 h-5 text-primary" />Réalisations</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Gérez les réalisations affichées sur le site.</p>
              </div>
              <Button onClick={() => openRealisationDialog()} className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                <Plus className="w-4 h-4 mr-2" />Ajouter
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {realisations.map((r) => (
                <Card key={r.id} className="overflow-hidden flex flex-col">
                  <div className="h-36 overflow-hidden">
                    <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{r.title}</h3>
                        <Badge variant="secondary" className="text-xs mt-0.5">{r.category}</Badge>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openRealisationDialog(r)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteRealisation(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                    {r.techniques.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {r.techniques.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                  </div>
                </Card>
              ))}
              {realisations.length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">Aucune réalisation. Cliquez sur "Ajouter".</div>
              )}
            </div>
          </TabsContent>

          {/* ── Contact ── */}
          <TabsContent value="contact" className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2"><Phone className="w-5 h-5 text-primary" />Coordonnées & réseaux sociaux</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Ces informations apparaissent dans la barre en haut du site, le footer et la page Contact.</p>
            </div>
            <Card className="p-6 space-y-4 max-w-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coordonnées</p>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} placeholder="contact@votresite.dz" />
              </div>
              <div className="space-y-1.5">
                <Label>Téléphone</Label>
                <Input value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} placeholder="05 00 00 00 00" />
              </div>
              <div className="space-y-1.5">
                <Label>Adresse</Label>
                <Input value={contactInfo.address} onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })} placeholder="Votre adresse, Algérie" />
              </div>
              <div className="space-y-1.5">
                <Label>Horaires</Label>
                <Input value={contactInfo.hours} onChange={(e) => setContactInfo({ ...contactInfo, hours: e.target.value })} placeholder="Lun-Ven : 9h-18h" />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Réseaux sociaux</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      Instagram
                    </Label>
                    <Input
                      value={contactInfo.instagram}
                      onChange={(e) => setContactInfo({ ...contactInfo, instagram: e.target.value })}
                      placeholder="https://instagram.com/votre_compte"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </Label>
                    <Input
                      value={contactInfo.facebook}
                      onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                      placeholder="https://facebook.com/votre_page"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveContact} disabled={savingContact} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                {savingContact ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement…</> : "Enregistrer"}
              </Button>
            </Card>
          </TabsContent>

        </Tabs>

        {/* ── Order Dialog ── */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Détails commande</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-5">

                {/* Infos client */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Nom</p>
                      <p className="font-semibold text-foreground">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Date</p>
                      <p className="font-medium">{selectedOrder.date}</p>
                    </div>
                    {selectedOrder.email && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                        <a href={`mailto:${selectedOrder.email}`} className="font-medium text-primary hover:underline">{selectedOrder.email}</a>
                      </div>
                    )}
                    {selectedOrder.phone && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Téléphone</p>
                        <a href={`tel:${selectedOrder.phone}`} className="font-medium text-primary hover:underline">{selectedOrder.phone}</a>
                      </div>
                    )}
                    {selectedOrder.address && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs mb-0.5">Adresse de livraison</p>
                        <p className="font-medium">{selectedOrder.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Articles commandés */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Articles commandés</p>
                  <div className="bg-muted/20 rounded-xl p-3 space-y-2">
                    {selectedOrder.product.split("\n").map((line, i) => {
                      const isCustom = line.startsWith("[SUR MESURE]");
                      const clean = isCustom ? line.replace("[SUR MESURE] ", "") : line;
                      const parts = clean.split(" | ");
                      return (
                        <div key={i} className={`text-sm p-2 rounded-lg ${isCustom ? "bg-primary/5 border border-primary/15" : ""}`}>
                          {isCustom && <span className="text-[10px] font-bold text-primary uppercase tracking-wide block mb-0.5">Sur mesure</span>}
                          {parts.map((part, j) => (
                            <p key={j} className={j === 0 ? "font-medium text-foreground" : "text-xs text-muted-foreground"}>{part}</p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes / personnalisation */}
                {selectedOrder.customization && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes client</p>
                    <p className="text-sm bg-muted/20 rounded-xl p-3">{selectedOrder.customization}</p>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl px-4 py-3">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatDA(selectedOrder.total)}</span>
                </div>

                {/* Statut */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Statut</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["pending","processing","completed","cancelled"] as Order["status"][]).map((s) => (
                      <Button key={s} size="sm" variant={selectedOrder.status === s ? "default" : "outline"} className="rounded-full"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, s)}>
                        {s === "pending" ? "En attente" : s === "processing" ? "En cours" : s === "completed" ? "Terminée" : "Annulée"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <Button variant="destructive" size="sm" className="rounded-full gap-2"
                    onClick={() => handleDeleteOrder(selectedOrder.id)}>
                    <Trash2 className="w-4 h-4" />Supprimer cette commande
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Product Dialog ── */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Photo de couverture</Label>
                <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/20 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors group"
                  onClick={() => coverInputRef.current?.click()}>
                  {productForm.coverImageUrl ? (
                    <>
                      <img src={productForm.coverImageUrl} alt="Couverture" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                        <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full flex items-center gap-1"><Camera className="w-3.5 h-3.5" />Changer</span>
                        <button type="button" className="bg-red-500 text-white rounded-full p-1.5"
                          onClick={(e) => { e.stopPropagation(); setProductForm((prev) => ({ ...prev, coverImageUrl: undefined, coverFile: null })); }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-sm">Cliquer pour ajouter une photo de couverture</span>
                    </div>
                  )}
                </div>
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pname">Nom *</Label>
                <Input id="pname" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Ex: T-Shirt Premium" required />
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie *</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    {categories.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">Créez d'abord une catégorie</div>}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pprice">Prix (DA) *</Label>
                  <div className="relative">
                    <Input id="pprice" type="number" min="0" step="1" value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })} className="pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DA</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pminqty">Qté min. *</Label>
                  <Input id="pminqty" type="number" min="1" value={productForm.minQuantity}
                    onChange={(e) => setProductForm({ ...productForm, minQuantity: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pstock">Stock *</Label>
                <Input id="pstock" type="number" min="0" value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="psizes">Tailles * <span className="text-muted-foreground font-normal text-xs">(séparées par des virgules)</span></Label>
                <Input id="psizes" value={productForm.sizes}
                  onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })} placeholder="XS, S, M, L, XL" />
              </div>
              <div className="space-y-2">
                <Label>Couleurs * <span className="text-muted-foreground font-normal text-xs">({productForm.colors.length} sélectionnée{productForm.colors.length > 1 ? "s" : ""})</span></Label>
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-xl bg-muted/10">
                  {ALL_COLORS.map((color) => {
                    const hex = COLOR_HEX[color] ?? "#ddd";
                    const selected = productForm.colors.includes(color);
                    return (
                      <button key={color} type="button" onClick={() => toggleColor(color)}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border transition-all ${selected ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 border"
                          style={{ backgroundColor: hex, borderColor: hex === "#FFFFFF" ? "#e0e0e0" : "transparent" }} />
                        {color}{selected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)} className="flex-1 rounded-full">Annuler</Button>
                <Button type="submit" disabled={savingProduct} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  {savingProduct ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement…</> : editingProduct ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Custom Item Dialog ── */}
        <Dialog open={isCustomItemDialogOpen} onOpenChange={setIsCustomItemDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{customItemForm.id ? "Modifier l'article" : "Nouvel article sur mesure"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCustomItemSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Photo (optionnel)</Label>
                <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/20 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors group"
                  onClick={() => customItemCoverRef.current?.click()}>
                  {customItemForm.coverImageUrl ? (
                    <>
                      <img src={customItemForm.coverImageUrl} alt="cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                        <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full flex items-center gap-1"><Camera className="w-3.5 h-3.5" />Changer</span>
                        <button type="button" className="bg-red-500 text-white rounded-full p-1.5"
                          onClick={(e) => { e.stopPropagation(); setCustomItemForm((p) => ({ ...p, coverImageUrl: undefined, coverFile: null })); }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImagePlus className="w-7 h-7" /><span className="text-sm">Ajouter une photo</span>
                    </div>
                  )}
                </div>
                <input ref={customItemCoverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCustomItemCoverChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ciname">Nom *</Label>
                <Input id="ciname" value={customItemForm.name}
                  onChange={(e) => setCustomItemForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: T-Shirt, Casquette brodée…" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ciprice">Prix (DA) <span className="text-muted-foreground font-normal text-xs">— laisser 0 si à confirmer</span></Label>
                <div className="relative">
                  <Input id="ciprice" type="number" min="0" step="50"
                    value={customItemForm.price}
                    onChange={(e) => setCustomItemForm((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                    className="pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">DA</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cidesc">Description <span className="text-muted-foreground font-normal text-xs">(optionnel)</span></Label>
                <Textarea id="cidesc" rows={2} value={customItemForm.description}
                  onChange={(e) => setCustomItemForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Ex: Disponible en plusieurs coloris…" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCustomItemDialogOpen(false)} className="flex-1 rounded-full">Annuler</Button>
                <Button type="submit" disabled={savingCustomItem} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  {savingCustomItem ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement…</> : customItemForm.id ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Realisation Dialog ── */}
        <Dialog open={isRealisationDialogOpen} onOpenChange={setIsRealisationDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {editingRealisation ? "Modifier la réalisation" : "Nouvelle réalisation"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRealisationSubmit} className="space-y-4">
              {/* Image */}
              <div className="space-y-1.5">
                <Label>Photo *</Label>
                <div
                  className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/20 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors group"
                  onClick={() => realisationImgRef.current?.click()}
                >
                  {realisationForm.imageUrl ? (
                    <>
                      <img src={realisationForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                        <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full flex items-center gap-1"><Camera className="w-3.5 h-3.5" />Changer</span>
                        <button type="button" className="bg-red-500 text-white rounded-full p-1.5"
                          onClick={(e) => { e.stopPropagation(); setRealisationForm((p) => ({ ...p, imageUrl: "", imageFile: null })); }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-sm">Cliquer pour ajouter une photo</span>
                    </div>
                  )}
                </div>
                <input ref={realisationImgRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleRealisationImageChange} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rtitle">Titre *</Label>
                <Input id="rtitle" value={realisationForm.title}
                  onChange={(e) => setRealisationForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Collection Mariage Champêtre" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rcat">Catégorie *</Label>
                <Input id="rcat" value={realisationForm.category}
                  onChange={(e) => setRealisationForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Ex: Événement, Sport, Décoration…" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rdesc">Description courte</Label>
                <Input id="rdesc" value={realisationForm.description}
                  onChange={(e) => setRealisationForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Une ligne de description" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rdetails">Détails</Label>
                <Textarea id="rdetails" rows={3} value={realisationForm.details}
                  onChange={(e) => setRealisationForm((p) => ({ ...p, details: e.target.value }))}
                  placeholder="Description complète de la réalisation…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rtech">Techniques <span className="text-muted-foreground font-normal text-xs">(séparées par des virgules)</span></Label>
                <Input id="rtech" value={realisationForm.techniques}
                  onChange={(e) => setRealisationForm((p) => ({ ...p, techniques: e.target.value }))}
                  placeholder="Broderie, Flocage, Sérigraphie" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsRealisationDialogOpen(false)} className="flex-1 rounded-full">Annuler</Button>
                <Button type="submit" disabled={savingRealisation} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  {savingRealisation ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement…</> : editingRealisation ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}
