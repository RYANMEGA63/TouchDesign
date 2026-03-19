import { Link } from "react-router";
import { ArrowRight, Heart, Sparkles, Package, Palette, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Home() {
  const benefits = [
    { icon: Palette, title: "Personnalisation Totale", description: "Créez des produits uniques qui vous ressemblent" },
    { icon: Star,    title: "Qualité Premium",         description: "Matériaux haut de gamme pour des créations durables" },
    { icon: Heart,   title: "Fait avec Amour",         description: "Chaque pièce réalisée avec soin et passion" },
    { icon: Package, title: "Livraison Soignée",       description: "Emballage élégant et envoi rapide" },
  ];

  const steps = [
    { step: "01", title: "Choisissez",       desc: "Parcourez le catalogue et sélectionnez votre produit", icon: "🛍️" },
    { step: "02", title: "Personnalisez",    desc: "Couleur, taille, emplacement — ou envoyez votre design", icon: "🎨" },
    { step: "03", title: "On vous contacte", desc: "Nous confirmons les détails, le prix et le délai", icon: "💬" },
    { step: "04", title: "Livraison",        desc: "Votre commande préparée avec soin et livrée chez vous", icon: "📦" },
  ];

  return (
    <div className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-secondary/30 to-accent/20">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-10 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-20 right-4 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

            {/* Text */}
            <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-border">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">Créations uniques et personnalisées</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                Donnez vie à vos{" "}
                <span className="text-primary">idées créatives</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Transformez vos moments spéciaux en souvenirs inoubliables avec nos produits personnalisés de haute qualité.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button asChild size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-md group w-full sm:w-auto">
                  <Link to="/catalogue">
                    Découvrir le catalogue
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline"
                  className="rounded-full px-8 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 w-full sm:w-auto">
                  <Link to="/realisations">Nos réalisations</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-square max-w-sm sm:max-w-md mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1762111067760-1f0fc2aa2866?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0aWxlJTIwcHJpbnRpbmclMjBjcmFmdHN8ZW58MXx8fHwxNzczODQxMjM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Atelier de flocage créatif"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-2 sm:-left-6 bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-border">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">100% Personnalisé</p>
                    <p className="text-xs text-muted-foreground">Fait sur commande</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bénéfices ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Nous mettons tout notre savoir-faire à votre service
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <Card key={i} className="p-4 sm:p-6 text-center hover:shadow-md transition-shadow bg-gradient-to-b from-white to-muted/30 border-border/60">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-muted/40 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Commander votre création personnalisée en 4 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 z-0" />
            {steps.map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white border-2 border-primary/15 shadow-sm flex items-center justify-center text-2xl sm:text-3xl">
                  {s.icon}
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-primary/60 tracking-widest uppercase">{s.step}</span>
                  <h3 className="font-heading text-sm sm:text-base lg:text-lg font-semibold text-foreground mt-0.5 mb-1">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-md w-full sm:w-auto">
              <Link to="/catalogue">Commencer ma personnalisation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-14 sm:py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à créer quelque chose d'unique ?
          </h2>
          <p className="text-primary-foreground/85 mb-8 text-sm sm:text-base max-w-xl mx-auto">
            Contactez-nous dès aujourd'hui et donnons vie ensemble à vos projets
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-semibold w-full sm:w-auto">
              <Link to="/contact">Nous contacter</Link>
            </Button>
            <Button asChild size="lg" variant="outline"
              className="rounded-full px-8 border-2 border-white/60 text-primary-foreground hover:bg-white/10 w-full sm:w-auto">
              <Link to="/realisations">Voir nos créations</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
