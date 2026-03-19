import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Upload, ImagePlus, Sparkles, Plus, X, CheckCircle2, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

import { fetchProducts, fetchCategories, fetchColorImages, COLOR_HEX, StoredProduct, formatDA } from "../productStore";
import { fetchCustomOrderItems, CustomOrderItem } from "../customOrderStore";
import { useCart } from "../cartStore";

interface ColorOption { name: string; hex: string; }

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  minQuantity: number;
  defaultImage: string;
  description: string;
  customizations: { colors: ColorOption[]; sizes: string[]; };
  previewShape: "tshirt" | "hoodie" | "totebag" | "coussin" | "casquette" | "trousse";
}

const SHAPE_MAP: Record<string, Product["previewShape"]> = {
  "1": "tshirt", "2": "hoodie", "3": "totebag", "4": "coussin", "5": "casquette", "6": "trousse",
};
function guessShape(id: string, name: string): Product["previewShape"] {
  if (SHAPE_MAP[id]) return SHAPE_MAP[id];
  const n = name.toLowerCase();
  if (n.includes("sweat") || n.includes("hoodie") || n.includes("capuche")) return "hoodie";
  if (n.includes("tote") || n.includes("sac")) return "totebag";
  if (n.includes("coussin")) return "coussin";
  if (n.includes("casquette")) return "casquette";
  if (n.includes("trousse")) return "trousse";
  return "tshirt";
}

const DEFAULT_IMAGES: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1617804148450-ae41d0f6b94d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBlbWJyb2lkZXJ5JTIwY3V0ZSUyMHByb2R1Y3RzfGVufDF8fHx8MTc3Mzg0MTIzOHww&ixlib=rb-4.1.0&q=80&w=1080",
  "2": "https://images.unsplash.com/photo-1760446411816-f5484549fb51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbGl6ZWQlMjBnaWZ0cyUyMHdvcmtzaG9wfGVufDF8fHx8MTc3Mzg0MTIzOXww&ixlib=rb-4.1.0&q=80&w=1080",
  "3": "https://images.unsplash.com/photo-1762111067760-1f0fc2aa2866?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0aWxlJTIwcHJpbnRpbmclMjBjcmFmdHN8ZW58MXx8fHwxNzczODQxMjM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "4": "https://images.unsplash.com/photo-1654175849714-9e1b0d351003?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwaG9tZSUyMGRlY29yYXRpb258ZW58MXx8fHwxNzczODQxMjM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "5": "https://images.unsplash.com/photo-1626980714826-ad7bf460a027?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0eSUyMGNlbGVicmF0aW9uJTIwcGFzdGVsfGVufDF8fHx8MTc3Mzg0MTIzOXww&ixlib=rb-4.1.0&q=80&w=1080",
  "6": "https://images.unsplash.com/photo-1617804148450-ae41d0f6b94d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBlbWJyb2lkZXJ5JTIwY3V0ZSUyMHByb2R1Y3RzfGVufDF8fHx8MTc3Mzg0MTIzOHww&ixlib=rb-4.1.0&q=80&w=1080",
};
const FALLBACK_IMAGE = DEFAULT_IMAGES["1"];

function storedToProduct(p: StoredProduct): Product {
  return {
    id: p.id, name: p.name, category: p.category, basePrice: p.price, minQuantity: p.minQuantity ?? 1,
    defaultImage: p.coverImageUrl ?? DEFAULT_IMAGES[p.id] ?? FALLBACK_IMAGE,
    description: p.name,
    previewShape: guessShape(p.id, p.name),
    customizations: {
      colors: p.colors.map((c) => ({ name: c, hex: COLOR_HEX[c] ?? "#DDDDDD" })),
      sizes: p.sizes,
    },
  };
}

function TshirtSVG({ color }: { color: string }) {
  const s = color === "#FFFFFF" ? "#e0e0e0" : color === "#1a1a1a" ? "#555" : "rgba(0,0,0,0.1)";
  const logo = color === "#FFFFFF" ? "#ccc" : "rgba(255,255,255,0.45)";
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <path d="M20 30L10 55L30 58L30 100L90 100L90 58L110 55L100 30L80 20Q60 30 40 20Z" fill={color} stroke={s} strokeWidth="1.5"/>
      <path d="M40 20Q60 34 80 20" fill="none" stroke={s} strokeWidth="1.5"/>
      <circle cx="60" cy="63" r="10" fill="none" stroke={logo} strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="60" y="67" textAnchor="middle" fontSize="7" fill={logo} fontFamily="sans-serif">logo</text>
    </svg>
  );
}
function HoodieSVG({ color }: { color: string }) {
  const s = color === "#FFFFFF" ? "#e0e0e0" : color === "#1a1a1a" ? "#555" : "rgba(0,0,0,0.1)";
  const logo = color === "#FFFFFF" ? "#ccc" : "rgba(255,255,255,0.45)";
  return (
    <svg viewBox="0 0 120 130" width="100%" height="100%">
      <path d="M18 35L8 65L28 68L28 110L92 110L92 68L112 65L102 35L82 22Q60 16 38 22Z" fill={color} stroke={s} strokeWidth="1.5"/>
      <path d="M38 22Q60 8 82 22Q72 38 60 40Q48 38 38 22Z" fill={color} stroke={s} strokeWidth="1.5"/>
      <rect x="42" y="80" width="36" height="16" rx="4" fill="none" stroke={logo} strokeWidth="1"/>
      <circle cx="60" cy="64" r="9" fill="none" stroke={logo} strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="60" y="68" textAnchor="middle" fontSize="7" fill={logo} fontFamily="sans-serif">logo</text>
    </svg>
  );
}
function TotebagSVG({ color }: { color: string }) {
  const s = color === "#FFFFFF" ? "#e0e0e0" : color === "#1a1a1a" ? "#555" : "rgba(0,0,0,0.1)";
  const logo = color === "#FFFFFF" ? "#ccc" : "rgba(255,255,255,0.45)";
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <path d="M42 38Q42 18 60 18Q78 18 78 38" fill="none" stroke={s} strokeWidth="3" strokeLinecap="round"/>
      <rect x="20" y="38" width="80" height="72" rx="6" fill={color} stroke={s} strokeWidth="1.5"/>
      <circle cx="60" cy="74" r="12" fill="none" stroke={logo} strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="60" y="78" textAnchor="middle" fontSize="7" fill={logo} fontFamily="sans-serif">logo</text>
    </svg>
  );
}
function CoussinSVG({ color }: { color: string }) {
  const s = color === "#FFFFFF" ? "#e0e0e0" : color === "#1a1a1a" ? "#555" : "rgba(0,0,0,0.1)";
  const logo = color === "#FFFFFF" ? "#ccc" : "rgba(255,255,255,0.45)";
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%">
      <rect x="15" y="25" width="90" height="70" rx="14" fill={color} stroke={s} strokeWidth="1.5"/>
      <rect x="22" y="32" width="76" height="56" rx="10" fill="none" stroke={logo} strokeWidth="1"/>
      <circle cx="60" cy="60" r="13" fill="none" stroke={logo} strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="60" y="64" textAnchor="middle" fontSize="7" fill={logo} fontFamily="sans-serif">logo</text>
    </svg>
  );
}
function CasquetteSVG({ color }: { color: string }) {
  const s = color === "#FFFFFF" ? "#e0e0e0" : color === "#1a1a1a" ? "#555" : "rgba(0,0,0,0.1)";
  const logo = color === "#FFFFFF" ? "#ccc" : "rgba(255,255,255,0.45)";
  return (
    <svg viewBox="0 0 120 100" width="100%" height="100%">
      <path d="M20 65Q20 28 60 25Q100 28 100 65Z" fill={color} stroke={s} strokeWidth="1.5"/>
      <path d="M15 65Q60 72 105 65" fill={color} stroke={s} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="60" cy="26" r="4" fill={color} stroke={s} strokeWidth="1"/>
      <circle cx="60" cy="52" r="9" fill="none" stroke={logo} strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="60" y="56" textAnchor="middle" fontSize="7" fill={logo} fontFamily="sans-serif">logo</text>
    </svg>
  );
}
function TrousseSVG({ color }: { color: string }) {
  const s = color === "#FFFFFF" ? "#e0e0e0" : color === "#1a1a1a" ? "#555" : "rgba(0,0,0,0.1)";
  const logo = color === "#FFFFFF" ? "#ccc" : "rgba(255,255,255,0.45)";
  return (
    <svg viewBox="0 0 120 90" width="100%" height="100%">
      <rect x="10" y="20" width="100" height="55" rx="10" fill={color} stroke={s} strokeWidth="1.5"/>
      <line x1="10" y1="22" x2="110" y2="22" stroke={logo} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="110" cy="22" r="4" fill={logo} stroke={s} strokeWidth="1"/>
      <circle cx="60" cy="50" r="10" fill="none" stroke={logo} strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="60" y="54" textAnchor="middle" fontSize="7" fill={logo} fontFamily="sans-serif">logo</text>
    </svg>
  );
}
function ShapeSVG({ shape, color }: { shape: Product["previewShape"]; color: string }) {
  if (shape === "tshirt") return <TshirtSVG color={color} />;
  if (shape === "hoodie") return <HoodieSVG color={color} />;
  if (shape === "totebag") return <TotebagSVG color={color} />;
  if (shape === "coussin") return <CoussinSVG color={color} />;
  if (shape === "casquette") return <CasquetteSVG color={color} />;
  return <TrousseSVG color={color} />;
}

function ProductCardImage({ product, colorImages }: { product: Product; colorImages: Record<string, string> }) {
  const firstColorImg = product.customizations.colors.map((c) => colorImages[c.name]).find(Boolean);
  const src = firstColorImg || product.defaultImage;
  return (
    <img src={src} alt={product.name}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      onError={(e) => { (e.target as HTMLImageElement).src = product.defaultImage; }} />
  );
}

function DialogPreview({ product, colorName, colorHex, colorImages }: {
  product: Product; colorName: string; colorHex: string; colorImages: Record<string, string>;
}) {
  const photo = colorName ? colorImages[colorName] : null;
  return (
    <div className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "#f8f4f0" }}>
      {photo ? (
        <img src={photo} alt={colorName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full p-6 flex items-center justify-center">
          <ShapeSVG shape={product.previewShape} color={colorHex} />
        </div>
      )}
    </div>
  );
}


export function Catalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const [formData, setFormData] = useState({ color: "", size: "", quantity: 1 });
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [customOrderOpen, setCustomOrderOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    productId: "", photos: [] as { file: File; preview: string }[], placement: "", notes: "", quantity: 1,
  });
  const [customOrderItems, setCustomOrderItems] = useState<CustomOrderItem[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, Record<string, string>>>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>(["Tous"]);
  const customPhotosInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const [stored, cats, items] = await Promise.all([
        fetchProducts(), fetchCategories(), fetchCustomOrderItems(),
      ]);
      setProducts(stored.map(storedToProduct));
      setCustomOrderItems(items);
      setAvailableCategories(["Tous", ...cats]);

      const allImgs: Record<string, Record<string, string>> = {};
      await Promise.all(stored.map(async (p) => {
        const imgs = await fetchColorImages(p.id);
        if (Object.keys(imgs).length > 0) allImgs[p.id] = imgs;
      }));
      setColorImages(allImgs);
    })();
  }, []);

  // Filtering: category + full-text search (name, category, colors)
  const filteredProducts = products
    .filter((p) => selectedCategory === "Tous" || p.category === selectedCategory)
    .filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.customizations.colors.some((c) => c.name.toLowerCase().includes(q))
      );
    });

  const selectedColorObj = selectedProduct?.customizations.colors.find((c) => c.name === formData.color);
  const previewHex = selectedColorObj?.hex ?? "#EEEEEE";
  const productColorImages = selectedProduct ? (colorImages[selectedProduct.id] ?? {}) : {};

  const closeOrderDialog = () => {
    setSelectedProduct(null);
    setFormData({ color: "", size: "", quantity: 1 });
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.color) { toast.error("Veuillez choisir une couleur"); return; }
    if (!formData.size)  { toast.error("Veuillez choisir une taille");  return; }
    if (!selectedProduct) return;
    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      color: formData.color,
      size: formData.size,
      quantity: formData.quantity,
      unitPrice: selectedProduct.basePrice,
      imageUrl: selectedProduct.defaultImage,
    });
    toast.success(`"${selectedProduct.name}" ajouté au panier !`);
    closeOrderDialog();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.productId) { toast.error("Veuillez choisir un produit"); return; }
    if (customForm.photos.length === 0) { toast.error("Ajoutez au moins une photo ou design"); return; }
    if (!customForm.placement) { toast.error("Précisez l'emplacement souhaité"); return; }
    const selectedItem = customOrderItems.find((i) => i.id === customForm.productId);
    addItem({
      productId: `custom_${customForm.productId}_${Date.now()}`,
      productName: `${selectedItem?.name ?? "Sur mesure"} — personnalisé`,
      color: "Sur mesure",
      size: "Sur mesure",
      quantity: customForm.quantity,
      unitPrice: selectedItem?.price ?? 0,
      imageUrl: selectedItem?.coverImageUrl,
      customDetails: { placement: customForm.placement, notes: customForm.notes || undefined },
    });
    toast.success("Demande ajoutée au panier ! Finalisez votre commande 🌸");
    setCustomOrderOpen(false);
    setCustomForm({ productId: "", photos: [], placement: "", notes: "", quantity: 1 });
    window.dispatchEvent(new Event("open-checkout"));
  };

  const handleCustomPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const newPhotos = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setCustomForm((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    e.target.value = "";
  };

  const removeCustomPhoto = (index: number) => {
    setCustomForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Notre Catalogue</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">Découvrez nos produits et créez vos articles personnalisés</p>
        </div>

        {/* ── Search bar ─────────────────────────────────────────── */}
        <div className="max-w-xl mx-auto mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Rechercher un produit, une couleur…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-full border-border focus-visible:ring-primary/40 bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Effacer"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category filters ────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6 sm:mb-10">
          {availableCategories.map((c) => (
            <Button key={c} variant={selectedCategory === c ? "default" : "outline"}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full px-4 sm:px-6 text-sm ${selectedCategory === c ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" : "border-border hover:border-primary/40"}`}>
              {c}
            </Button>
          ))}
        </div>

        {/* ── Search results counter ──────────────────────────────── */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            {filteredProducts.length === 0
              ? `Aucun résultat pour « ${searchQuery} »`
              : `${filteredProducts.length} produit${filteredProducts.length > 1 ? "s" : ""} trouvé${filteredProducts.length > 1 ? "s" : ""} pour « ${searchQuery} »`}
          </p>
        )}

        {/* ── Product grid ────────────────────────────────────────── */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => {
              const openDialog = () => {
                setSelectedProduct(product);
                setFormData({ color: "", size: "", quantity: product.minQuantity ?? 1 });
              };
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square overflow-hidden relative cursor-pointer" onClick={openDialog}>
                    <ProductCardImage product={product} colorImages={colorImages[product.id] ?? {}} />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <span className="text-xs font-medium text-primary">{product.category}</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground mb-2 cursor-pointer hover:text-primary transition-colors" onClick={openDialog}>
                      {product.name}
                    </h3>
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {product.customizations.colors.slice(0, 8).map((c) => (
                        <div key={c.name} title={c.name}
                          className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex-shrink-0"
                          style={{ backgroundColor: c.hex, borderColor: c.hex === "#FFFFFF" ? "#e0e0e0" : "transparent" }} />
                      ))}
                      {product.customizations.colors.length > 8 && (
                        <span className="text-xs text-muted-foreground self-center">+{product.customizations.colors.length - 8}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg sm:text-xl font-bold text-primary leading-none">{formatDA(product.basePrice)}</span>
                      <Button type="button" size="sm" onClick={openDialog}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs sm:text-sm px-3 sm:px-4 shadow-sm">
                        <ShoppingCart className="w-3.5 h-3.5 mr-1 sm:mr-2" />Commander
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">Aucun produit trouvé</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Essayez un autre mot-clé ou une autre catégorie." : "Aucun produit dans cette catégorie pour l'instant."}
            </p>
            {(searchQuery || selectedCategory !== "Tous") && (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("Tous"); }} className="rounded-full">
                Voir tous les produits
              </Button>
            )}
          </div>
        )}

        {/* ── Custom order banner ─────────────────────────────────── */}
        <div className="mt-10 sm:mt-16 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 border border-primary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-foreground mb-1">Commande sur mesure</h2>
            <p className="text-muted-foreground text-sm">Vous avez votre propre design ? Envoyez-nous votre photo et dites-nous où vous souhaitez la broder.</p>
          </div>
          <Button onClick={() => setCustomOrderOpen(true)} className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 sm:px-6 w-full sm:w-auto shadow-sm">
            <ImagePlus className="w-4 h-4 mr-2" />Envoyer ma photo
          </Button>
        </div>

        {/* ── Add to Cart Dialog ─────────────────────────────────── */}
        <Dialog open={!!selectedProduct} onOpenChange={closeOrderDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading text-lg sm:text-xl">{selectedProduct.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddToCart} className="space-y-4 mt-2">
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="w-24 sm:w-32 flex-shrink-0 space-y-1">
                      <DialogPreview product={selectedProduct} colorName={formData.color} colorHex={previewHex} colorImages={productColorImages} />
                      <p className="text-xs text-center text-muted-foreground h-4 truncate">{formData.color || "Choisir une couleur"}</p>
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="space-y-1.5">
                        <Label>Couleur *</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.customizations.colors.map((c) => (
                            <button key={c.name} type="button" title={c.name}
                              onClick={() => setFormData({ ...formData, color: c.name })}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-150 flex-shrink-0"
                              style={{
                                backgroundColor: c.hex,
                                borderColor: formData.color === c.name ? "#F472A0" : c.hex === "#FFFFFF" ? "#e0e0e0" : "transparent",
                                transform: formData.color === c.name ? "scale(1.25)" : "scale(1)",
                                boxShadow: formData.color === c.name ? "0 0 0 2px #F472A0" : "none",
                              }} />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="size">Taille *</Label>
                        <Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v })}>
                          <SelectTrigger id="size"><SelectValue placeholder="Choisir une taille" /></SelectTrigger>
                          <SelectContent>
                            {selectedProduct.customizations.sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="qty">Quantité {selectedProduct.minQuantity > 1 ? `(min. ${selectedProduct.minQuantity})` : ""}</Label>
                        <Input id="qty" type="number" min={selectedProduct.minQuantity ?? 1} value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/40 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prix estimé</span>
                    <span className="font-bold text-primary">{formatDA(selectedProduct.basePrice * formData.quantity)}</span>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" onClick={closeOrderDialog} className="flex-1 rounded-full">Annuler</Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm">
                      Ajouter au panier 🛍️
                    </Button>
                  </div>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Custom Order Dialog ────────────────────────────────── */}
        <Dialog open={customOrderOpen} onOpenChange={(open) => { setCustomOrderOpen(open); if (!open) setCustomForm({ productId: "", photos: [], placement: "", notes: "", quantity: 1 }); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />Commande personnalisée
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCustomSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Quel produit souhaitez-vous personnaliser ? *</Label>
                {customOrderItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Aucun produit disponible pour la personnalisation pour l'instant.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {customOrderItems.map((item) => {
                      const active = customForm.productId === item.id;
                      return (
                        <button key={item.id} type="button" onClick={() => setCustomForm({ ...customForm, productId: item.id })}
                          className={`rounded-xl border-2 p-3 flex items-center gap-3 transition-all text-left ${active ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            {item.coverImageUrl ? (
                              <img src={item.coverImageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                                <ImagePlus className="w-5 h-5 text-primary/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-foreground"}`}>{item.name}</p>
                            {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                            {item.price > 0 && <p className="text-xs font-semibold text-primary mt-0.5">{formatDA(item.price)}</p>}
                          </div>
                          {active && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Vos photos / designs *
                  <span className="ml-1 text-xs text-muted-foreground font-normal">({customForm.photos.length} ajoutée{customForm.photos.length > 1 ? "s" : ""})</span>
                </Label>
                {customForm.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {customForm.photos.map((p, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <img src={p.preview} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeCustomPhoto(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center px-1 py-0.5 truncate">{p.file.name}</div>
                      </div>
                    ))}
                    <button type="button" onClick={() => customPhotosInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 hover:border-primary/60 hover:bg-primary/5 transition-colors flex-shrink-0">
                      <Plus className="w-5 h-5 text-primary/50" />
                      <span className="text-[10px] text-muted-foreground">Ajouter</span>
                    </button>
                  </div>
                )}
                {customForm.photos.length === 0 && (
                  <div onClick={() => customPhotosInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors">
                    <Upload className="w-7 h-7 text-primary/50" />
                    <p className="text-sm text-muted-foreground text-center">
                      Cliquez pour ajouter une ou plusieurs photos<br />
                      <span className="text-xs">JPG, PNG, WEBP — vous pouvez en ajouter plusieurs</span>
                    </p>
                  </div>
                )}
                <input ref={customPhotosInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleCustomPhotosChange} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="placement">Emplacement souhaité *</Label>
                <Select value={customForm.placement} onValueChange={(v) => setCustomForm({ ...customForm, placement: v })}>
                  <SelectTrigger id="placement"><SelectValue placeholder="Où souhaitez-vous la broderie ?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poitrine-gauche">Poitrine gauche</SelectItem>
                    <SelectItem value="poitrine-centree">Poitrine centrée</SelectItem>
                    <SelectItem value="dos-haut">Dos (haut)</SelectItem>
                    <SelectItem value="dos-centre">Dos (centre)</SelectItem>
                    <SelectItem value="manche-gauche">Manche gauche</SelectItem>
                    <SelectItem value="manche-droite">Manche droite</SelectItem>
                    <SelectItem value="col">Près du col</SelectItem>
                    <SelectItem value="autre">Autre (préciser dans les notes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cqty">Quantité *</Label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setCustomForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                    className="w-10 h-10 rounded-full border border-border bg-muted hover:bg-primary/10 hover:border-primary flex items-center justify-center transition-colors font-bold text-lg">−</button>
                  <span className="w-12 text-center text-lg font-semibold">{customForm.quantity}</span>
                  <button type="button" onClick={() => setCustomForm((p) => ({ ...p, quantity: p.quantity + 1 }))}
                    className="w-10 h-10 rounded-full border border-border bg-muted hover:bg-primary/10 hover:border-primary flex items-center justify-center transition-colors font-bold text-lg">+</button>
                  <span className="text-xs text-muted-foreground">pièce{customForm.quantity > 1 ? "s" : ""}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cnotes">Précisions (optionnel)</Label>
                <Textarea id="cnotes" placeholder="Taille souhaitée, couleurs de fil, quantité, détails particuliers..."
                  value={customForm.notes} onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })} rows={2} />
              </div>

              <p className="text-xs text-muted-foreground">💌 Finalisez votre commande à l'étape suivante avec vos coordonnées.</p>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={() => setCustomOrderOpen(false)} className="flex-1 rounded-full">Annuler</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  Ajouter au panier
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
