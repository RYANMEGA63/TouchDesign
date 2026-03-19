import { useState, useEffect } from "react";
import { Calendar, Tag, Share2, Check, Loader2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { fetchRealisations, Realisation } from "../realisationsStore";

export function Realisations() {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Realisation | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Toutes");

  useEffect(() => {
    fetchRealisations().then((data) => { setRealisations(data); setLoading(false); });
  }, []);

  const categories = ["Toutes", ...Array.from(new Set(realisations.map((r) => r.category)))];
  const filtered = selectedCategory === "Toutes" ? realisations : realisations.filter((r) => r.category === selectedCategory);

  const handleShare = async (r: Realisation) => {
    const url = `${window.location.origin}/realisations#${r.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: r.title, text: r.description ?? "", url }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Nos Réalisations</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Découvrez quelques-unes de nos créations personnalisées
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8 sm:mb-10">
          {categories.map((cat) => (
            <Button key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm ${selectedCategory === cat ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" : "border-border hover:border-primary/40"}`}>
              {cat}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Aucune réalisation dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filtered.map((r) => (
              <Card key={r.id} id={r.id} className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden relative" onClick={() => setSelected(r)}>
                  <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-foreground text-xs border-0 shadow-sm">{r.category}</Badge>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground leading-tight flex-1">{r.title}</h3>
                    <button type="button" onClick={() => handleShare(r)}
                      className="btn-icon-sm flex-shrink-0 w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors" title="Partager">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                  {r.description && <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{r.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.createdAt}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{r.category}</span>
                  </div>
                  {r.techniques.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {r.techniques.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs px-2 py-0.5">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog détail */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-xl sm:max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
            {selected && (
              <>
                <div className="aspect-video overflow-hidden">
                  <img src={selected.imageUrl} alt={selected.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{selected.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{selected.createdAt}</span>
                        <Badge variant="secondary">{selected.category}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0 rounded-full gap-2 hidden sm:flex"
                      onClick={() => handleShare(selected)}>
                      <Share2 className="w-4 h-4" />Partager
                    </Button>
                  </div>
                  {selected.description && <p className="text-muted-foreground text-sm sm:text-base">{selected.description}</p>}
                  {selected.details && <p className="text-sm text-foreground leading-relaxed">{selected.details}</p>}
                  {selected.techniques.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Techniques</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.techniques.map((t) => (
                          <Badge key={t} className="bg-primary/10 text-primary border border-primary/20 text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">Vous voulez quelque chose de similaire ?</p>
                    <a href="/catalogue">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm">
                        Voir le catalogue
                      </Button>
                    </a>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
