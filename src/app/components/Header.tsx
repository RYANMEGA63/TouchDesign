import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Sparkles, ShoppingBag, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "../cartStore";
import { CheckoutDialog } from "./CheckoutDialog";
import { fetchContactInfo, ContactInfo } from "../realisationsStore";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [info, setInfo] = useState<ContactInfo>({ email: "", phone: "", address: "", hours: "", facebook: "", instagram: "" });

  useEffect(() => { fetchContactInfo().then(setInfo); }, []);

  useEffect(() => {
    const handler = () => setCheckoutOpen(true);
    window.addEventListener("open-checkout", handler);
    return () => window.removeEventListener("open-checkout", handler);
  }, []);

  const location = useLocation();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  // Fermer le menu si on clique hors du header
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const header = document.getElementById("site-header");
      if (header && !header.contains(e.target as Node)) setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/catalogue", label: "Catalogue" },
    { path: "/realisations", label: "Réalisations" },
    { path: "/contact", label: "Contact" },
  ];

  const hasTopBar = info.phone || info.email || info.instagram || info.facebook;

  return (
    <>
      {/* ── Barre info desktop ── */}
      {hasTopBar && (
        <div className="bg-primary text-primary-foreground text-xs py-2 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5 flex-wrap">
              {info.phone && (
                <a href={`tel:${info.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity font-medium">
                  <Phone className="w-3 h-3 shrink-0" />{info.phone}
                </a>
              )}
              {info.email && (
                <a href={`mailto:${info.email}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                  <Mail className="w-3 h-3 shrink-0" />{info.email}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              {info.instagram && (
                <a href={info.instagram} target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity" aria-label="Instagram">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {info.facebook && (
                <a href={info.facebook} target="_blank" rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity" aria-label="Facebook">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <header id="site-header" className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-border" : "bg-white/80 backdrop-blur-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-sm">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg sm:text-2xl font-bold text-foreground">
                ⚜️ Touche Design ⚜️
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`relative text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path ? "text-primary" : "text-foreground"
                  }`}>
                  {link.label}
                  {location.pathname === link.path && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button type="button" onClick={() => setCheckoutOpen(true)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={`Panier — ${totalItems} article${totalItems !== 1 ? "s" : ""}`}>
                <ShoppingBag className="w-5 h-5 text-foreground" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
              <Button onClick={() => setCheckoutOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 text-sm shadow-sm">
                Commander{totalItems > 0 ? ` (${totalItems})` : ""}
              </Button>
            </div>

            {/* Actions mobile */}
            <div className="flex items-center gap-1 md:hidden">
              <button type="button" onClick={() => setCheckoutOpen(true)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors" aria-label="Panier">
                <ShoppingBag className="w-5 h-5 text-foreground" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Menu">
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-white">
              <nav className="py-4 flex flex-col">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path}
                    className={`px-4 py-3 text-base font-medium transition-colors flex items-center gap-2 ${
                      location.pathname === link.path
                        ? "text-primary bg-primary/5"
                        : "text-foreground hover:bg-muted"
                    }`}>
                    {link.label}
                  </Link>
                ))}
                {/* Infos contact mobile */}
                {(info.phone || info.email) && (
                  <div className="px-4 pt-3 pb-1 mt-1 border-t border-border flex flex-col gap-2">
                    {info.phone && (
                      <a href={`tel:${info.phone.replace(/\s/g,"")}`} className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                        <Phone className="w-4 h-4 text-primary shrink-0" />{info.phone}
                      </a>
                    )}
                    {info.email && (
                      <a href={`mailto:${info.email}`} className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                        <Mail className="w-4 h-4 text-primary shrink-0" />{info.email}
                      </a>
                    )}
                    {(info.instagram || info.facebook) && (
                      <div className="flex gap-3 pt-1">
                        {info.instagram && (
                          <a href={info.instagram} target="_blank" rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors p-1">
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {info.facebook && (
                          <a href={info.facebook} target="_blank" rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors p-1">
                            <Facebook className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="px-4 pt-3 pb-2">
                  <Button onClick={() => { setIsMobileMenuOpen(false); setCheckoutOpen(true); }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm">
                    Commander{totalItems > 0 ? ` (${totalItems})` : ""}
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
