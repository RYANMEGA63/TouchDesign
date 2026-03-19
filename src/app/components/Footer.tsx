import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Heart, Instagram, Facebook, Mail, Phone, MapPin, Clock } from "lucide-react";
import { fetchContactInfo, ContactInfo } from "../realisationsStore";

export function Footer() {
  const [info, setInfo] = useState<ContactInfo>({ email: "", phone: "", address: "", hours: "", facebook: "", instagram: "" });
  useEffect(() => { fetchContactInfo().then(setInfo); }, []);

  return (
    <footer className="bg-white border-t border-border mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <h3 className="font-heading text-xl font-bold text-foreground">Flocage Créatif</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Créations personnalisées pour vos événements, fêtes et décoration. Des produits uniques et de qualité.
            </p>
            {(info.instagram || info.facebook) && (
              <div className="flex gap-2 pt-1">
                {info.instagram && (
                  <a href={info.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                    aria-label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {info.facebook && (
                  <a href={info.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                    aria-label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Navigation</h4>
            <nav className="flex flex-col gap-2">
              {[
                { to: "/", label: "Accueil" },
                { to: "/catalogue", label: "Catalogue" },
                { to: "/realisations", label: "Réalisations" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-2.5">
              {info.email && (
                <a href={`mailto:${info.email}`} className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" /><span className="break-all">{info.email}</span>
                </a>
              )}
              {info.phone && (
                <a href={`tel:${info.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 shrink-0" />{info.phone}
                </a>
              )}
              {info.address && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" /><span>{info.address}</span>
                </div>
              )}
              {info.hours && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" /><span>{info.hours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Commande rapide */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Commander</h4>
            <p className="text-sm text-muted-foreground">
              Parcourez notre catalogue et passez commande en ligne.
            </p>
            <Link to="/catalogue"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Voir le catalogue →
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">© 2026 Flocage Créatif. Tous droits réservés.</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Fait avec <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> pour vous
          </p>
        </div>
      </div>
    </footer>
  );
}
