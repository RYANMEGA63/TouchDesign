import { Mail, Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { fetchContactInfo, ContactInfo } from "../realisationsStore";
import { Link } from "react-router";

export function Contact() {
  const [info, setInfo] = useState<ContactInfo>({
    email: "", phone: "", address: "", hours: "", facebook: "", instagram: "",
  });

  useEffect(() => { fetchContactInfo().then(setInfo); }, []);

  type InfoCard = { icon: React.ElementType; label: string; value: string; href: string | null };
  const cards: InfoCard[] = [
    info.email   ? { icon: Mail,   label: "Email",    value: info.email,   href: `mailto:${info.email}` } : null,
    info.phone   ? { icon: Phone,  label: "Téléphone",value: info.phone,   href: `tel:${info.phone.replace(/\s/g, "")}` } : null,
    info.address ? { icon: MapPin, label: "Adresse",  value: info.address, href: null } : null,
    info.hours   ? { icon: Clock,  label: "Horaires", value: info.hours,   href: null } : null,
  ].filter(Boolean) as InfoCard[];

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Contactez-nous</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            Une question, un projet ? On est là pour vous aider.
          </p>
        </div>

        {/* Coordonnées */}
        {cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="p-4 sm:p-5 hover:shadow-md transition-shadow border-border/60">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">{card.label}</p>
                      {card.href ? (
                        <a href={card.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors break-words leading-snug">
                          {card.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-foreground break-words leading-snug">{card.value}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Réseaux sociaux */}
        {(info.instagram || info.facebook) && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 border-border/60">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-3 sm:mb-4">Suivez-nous</p>
            <div className="flex gap-3 flex-wrap">
              {info.instagram && (
                <a href={info.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium">
                  <Instagram className="w-4 h-4" />Instagram
                </a>
              )}
              {info.facebook && (
                <a href={info.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium">
                  <Facebook className="w-4 h-4" />Facebook
                </a>
              )}
            </div>
          </Card>
        )}

        {/* CTA */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 to-accent/20 border-primary/20 text-center">
          <h2 className="font-heading text-lg sm:text-xl font-semibold text-foreground mb-2">Prêt à commander ?</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Parcourez notre catalogue et passez commande directement en ligne. On vous recontacte pour confirmer les détails.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-sm w-full sm:w-auto">
            <Link to="/catalogue">Voir le catalogue</Link>
          </Button>
        </Card>

      </div>
    </div>
  );
}
