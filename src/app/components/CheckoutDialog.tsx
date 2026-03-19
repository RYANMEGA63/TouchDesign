// ── CheckoutDialog ───────────────────────────────────────────────
// Dialog global "Commander" : affiche le panier + formulaire coordonnées.
// Ouvert depuis le Header via le bouton panier.

import { useState } from "react";
import { Trash2, ShoppingBag, Loader2, Plus, Minus, MapPin, Phone, Mail, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useCart } from "../cartStore";
import { createOrder, formatDA } from "../productStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "cart" | "checkout";

export function CheckoutDialog({ open, onClose }: Props) {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    name: "", email: "", phone: "", address: "", notes: "",
  });

  const handleClose = () => {
    setStep("cart");
    onClose();
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim()) { toast.error("Le nom est obligatoire"); return; }
    if (!customer.email.trim() && !customer.phone.trim()) {
      toast.error("Email ou numéro de téléphone obligatoire"); return;
    }
    submitOrder();
  };

  const submitOrder = async () => {
    setSubmitting(true);

    const hasNormal = items.some((i) => !i.customDetails);
    const hasCustom = items.some((i) => !!i.customDetails);
    const orderType: "commande" | "sur-mesure" | "mix" =
      hasNormal && hasCustom ? "mix" : hasCustom ? "sur-mesure" : "commande";

    const placementLabels: Record<string, string> = {
      "poitrine-gauche": "Poitrine gauche", "poitrine-centree": "Poitrine centrée",
      "dos-haut": "Dos haut", "dos-centre": "Dos centre",
      "manche-gauche": "Manche gauche", "manche-droite": "Manche droite",
      "col": "Col", "autre": "Autre",
    };

    const productLines = items.map((item) => {
      if (item.customDetails) {
        const placement = placementLabels[item.customDetails.placement] ?? item.customDetails.placement;
        const notes = item.customDetails.notes ? ` — ${item.customDetails.notes}` : "";
        return `[SUR MESURE] ${item.productName} | Emplacement : ${placement} | Qté : ${item.quantity}${notes}`;
      }
      return `${item.productName} | Couleur : ${item.color} | Taille : ${item.size} | Qté : ${item.quantity}`;
    });

    const ok = await createOrder({
      customerName: customer.name.trim(),
      email: customer.email.trim() || customer.phone.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      product: productLines.join("\n"),
      orderType,
      status: "pending",
      total: totalPrice,
      customization: customer.notes.trim() || "",
    });
    setSubmitting(false);

    if (ok) {
      toast.success("Commande envoyée ! Nous vous contacterons très vite 🌸");
      clearCart();
      setCustomer({ name: "", email: "", phone: "", address: "", notes: "" });
      setStep("cart");
      handleClose();
    } else {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            {step === "cart" ? `Mon panier (${totalItems} article${totalItems > 1 ? "s" : ""})` : "Mes coordonnées"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Étape 1 : Panier ── */}
        {step === "cart" && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground text-sm">Votre panier est vide.</p>
                <Button variant="outline" onClick={handleClose} className="rounded-full">
                  Voir le catalogue
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border ${item.customDetails ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border"}`}>
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-primary/50" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{item.productName}</p>
                          {item.customDetails && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">Sur mesure</Badge>
                          )}
                        </div>
                        {item.customDetails ? (
                          <div className="mt-1 space-y-0.5">
                            <p className="text-xs text-muted-foreground">Emplacement : <span className="text-foreground">{item.customDetails.placement}</span></p>
                            {item.customDetails.notes && <p className="text-xs text-muted-foreground">Notes : <span className="text-foreground">{item.customDetails.notes}</span></p>}
                          </div>
                        ) : (
                          <div className="flex gap-1.5 mt-0.5 flex-wrap">
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">{item.color}</Badge>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">{item.size}</Badge>
                          </div>
                        )}
                        <p className="text-xs text-primary font-medium mt-1">
                          {item.unitPrice > 0 ? formatDA(item.unitPrice * item.quantity) : "Prix à confirmer"}
                        </p>
                      </div>

                      {/* Quantité — pour tous les types */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button type="button" onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors group">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl px-4 py-3">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">{formatDA(totalPrice)}</span>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleClose} className="flex-1 rounded-full">
                    Continuer les achats
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      // Pré-remplir avec les infos du client sur mesure si dispo
                      const customItem = items.find((i) => i.customDetails);
                      if (customItem?.customDetails && !customer.name) {
                        setCustomer((prev) => ({
                          ...prev,
                          name: prev.name || customItem.customDetails!.customerName || "",
                          phone: prev.phone || customItem.customDetails!.phone || "",
                          address: prev.address || customItem.customDetails!.address || "",
                        }));
                      }
                      setStep("checkout");
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    Commander →
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Étape 2 : Coordonnées ── */}
        {step === "checkout" && (
          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Récap commande */}
            <div className="bg-muted/20 rounded-xl p-3 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="font-medium text-foreground">{item.productName}</span>
                      {item.customDetails ? (
                        <span className="ml-1.5 text-primary text-[10px] font-semibold uppercase">sur mesure ×{item.quantity}</span>
                      ) : (
                        <span className="text-muted-foreground"> — {item.color}, {item.size} ×{item.quantity}</span>
                      )}
                      {item.customDetails?.placement && (
                        <p className="text-muted-foreground mt-0.5">Emplacement : {item.customDetails.placement}</p>
                      )}
                      {item.customDetails?.notes && (
                        <p className="text-muted-foreground">Notes : {item.customDetails.notes}</p>
                      )}
                    </div>
                    <span className="font-medium text-foreground flex-shrink-0">
                      {item.unitPrice > 0 ? formatDA(item.unitPrice * item.quantity) : "À confirmer"}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1.5 mt-1">
                <span>Total</span>
                <span className="text-primary">{totalPrice > 0 ? formatDA(totalPrice) : "À confirmer"}</span>
              </div>
            </div>

            {/* Nom */}
            <div className="space-y-1.5">
              <Label htmlFor="co-name" className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />Nom complet *
              </Label>
              <Input id="co-name" value={customer.name} required
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Votre nom et prénom" />
            </div>

            {/* Email OU Téléphone (au moins un) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co-email" className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />Email
                </Label>
                <Input id="co-email" type="email" value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="vous@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-phone" className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />Téléphone
                </Label>
                <Input id="co-phone" type="tel" value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="05 00 00 00 00" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Email ou téléphone obligatoire *</p>

            {/* Adresse livraison */}
            <div className="space-y-1.5">
              <Label htmlFor="co-address" className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />Adresse de livraison
              </Label>
              <Input id="co-address" value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder="Votre adresse complète" />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="co-notes">Précisions <span className="text-muted-foreground font-normal text-xs">(optionnel)</span></Label>
              <Textarea id="co-notes" rows={2} value={customer.notes}
                onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                placeholder="Texte à broder, couleur de fil, instructions…" />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setStep("cart")} className="flex-1 rounded-full">
                ← Retour
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                {submitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi…</>
                  : "Confirmer la commande ✓"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
