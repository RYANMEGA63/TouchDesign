# Documentation Design - Flocage Créatif

## 🎨 Vue d'ensemble

Site web professionnel pour une entreprise de flocage et personnalisation de produits. Le design adopte un style "cute et chill" avec des tons pastel doux, inspiré de sites lifestyle comme The Tea Story.

---

## 🎨 Identité Visuelle

### Palette de Couleurs

| Couleur | HEX | Usage |
|---------|-----|-------|
| **Rose Poudré** | `#FFB5C0` | Couleur primaire, CTA, accents |
| **Pêche** | `#FFDAC1` | Couleur secondaire, highlights |
| **Vert Sauge** | `#C8D5B9` | Accents, boutons secondaires |
| **Beige Crème** | `#FFF5E1` | Backgrounds, inputs |
| **Blanc Cassé** | `#FFFBF7` | Background principal |
| **Marron Doux** | `#6B5B4F` | Texte principal |
| **Gris Clair** | `#A89B91` | Texte secondaire |

### Typographies

#### Titres (h1, h2, h3, h4, h5, h6)
- **Police:** Playfair Display
- **Poids:** 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Style:** Serif élégant et raffiné
- **Usage:** Tous les titres, logo, éléments mis en avant

#### Texte courant
- **Police:** Inter
- **Poids:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Style:** Sans-serif moderne et lisible
- **Usage:** Paragraphes, labels, boutons, navigation

### Tailles de texte

| Élément | Taille | Usage |
|---------|--------|-------|
| text-sm | 0.875rem (14px) | Petits textes, captions |
| text-base | 1rem (16px) | Texte standard |
| text-lg | 1.125rem (18px) | Texte mis en avant |
| text-xl | 1.5rem (24px) | Sous-titres (h2) |
| text-2xl | 2.25rem (36px) | Titres (h1) |
| text-3xl | 3rem (48px) | Titres héros |
| text-4xl | 3.75rem (60px) | Super titres |

### Style d'icônes

- **Bibliothèque:** Lucide React
- **Style:** Ligne (outline), coins arrondis
- **Taille:** 16px (w-4 h-4) à 32px (w-8 h-8)
- **Couleurs:** Suivent la palette (primary, accent, foreground)

### Style d'illustrations

- **Approche:** Minimaliste et doux
- **Images:** Photos lifestyle, produits, ateliers
- **Traitement:** Coins arrondis (radius: 1rem), ombres douces
- **Overlays:** Gradients subtils pour améliorer la lisibilité

---

## 📐 Structure du Site

### Page d'Accueil

#### 1. Hero Section
- **Layout:** Grid 2 colonnes (texte + image)
- **Background:** Gradient pastel animé avec effet blob
- **Badge:** Pastille arrondie avec icône Sparkles
- **Titre:** Large, avec mot-clé en couleur primary
- **CTAs:** 2 boutons (primaire + outline)
- **Image:** Grande photo d'atelier, rotation 3° au hover

#### 2. Section Bénéfices
- **Layout:** Grid 4 colonnes (responsive)
- **Cards:** Fond blanc/muted, icône gradient circulaire
- **Icônes:** Palette, Star, Heart, Package
- **Hover:** Élévation ombre

#### 3. Section Catégories
- **Layout:** Grid 3 colonnes
- **Cards:** Image 4:3, overlay gradient, contenu superposé
- **Animation:** Scale image au hover
- **CTA:** Badge catégorie + bouton voir tout

#### 4. Section CTA Finale
- **Background:** Gradient primary/accent avec effets blur
- **Layout:** Centré, max-width
- **Boutons:** Blanc + outline blanc

### Page Catalogue

#### 1. Header
- **Titre centré**
- **Filtres:** Boutons pills arrondis

#### 2. Grille Produits
- **Layout:** Grid 3 colonnes (responsive)
- **Cards:** Image carré, badge catégorie, prix en primary
- **Hover:** Scale image + ombre

#### 3. Modal Commande
- **Layout:** Formulaire en 2 étapes
- **Sections:** Personnalisation + Informations client
- **Résumé:** Card gradient avec prix total
- **Validation:** Toast notifications

### Page Réalisations

#### 1. Grille Portfolio
- **Layout:** Masonry grid 3 colonnes
- **Cards:** Image 4:3, infos date/catégorie
- **Tags:** Techniques en badges

#### 2. Modal Détail
- **Image:** Grande, pleine largeur
- **Infos:** Titre, catégorie, date, description
- **Techniques:** Badges gradient
- **CTA:** Bannière gradient en bas

### Page Contact

#### 1. Layout 2 Colonnes
- **Gauche:** Formulaire de contact
- **Droite:** Informations + Map placeholder

#### 2. Cards Infos
- **Style:** Icône gradient circulaire + texte
- **Hover:** Ombre élevée
- **Links:** Email et téléphone cliquables

#### 3. CTA Devis
- **Card gradient** avec bouton blanc

### Page Admin

#### 1. Dashboard
- **Stats:** Cards avec icônes gradient
- **Metrics:** Commandes, produits, revenu

#### 2. Onglets
- **Tab 1:** Table commandes avec statuts
- **Tab 2:** Grid produits avec actions

#### 3. Modals
- **Détail commande:** Infos + changement statut
- **Gestion produit:** Formulaire CRUD

### Page 404

- **Layout:** Centré vertical
- **Icône:** Search dans cercle gradient
- **Titre:** "404" large
- **CTAs:** 2 boutons (accueil + catalogue)

---

## 🎯 UI Components

### Header / Navbar

#### Desktop
- **Position:** Sticky top, backdrop-blur au scroll
- **Logo:** Icône gradient cercle + nom
- **Navigation:** Links horizontaux avec underline active
- **CTA:** Bouton primary arrondi

#### Mobile
- **Menu burger** transforme en X
- **Navigation:** Drawer vertical
- **Background:** Blanc avec bordure top

### Footer

- **Background:** Blanc avec bordure top
- **Layout:** Grid 4 colonnes
- **Sections:** About, Navigation, Contact, Social
- **Social:** Icônes dans cercles avec hover
- **Bottom:** Copyright + message avec cœur

### Boutons

#### Primaire
```css
- Background: #FFB5C0 (primary)
- Hover: primary/90
- Text: #6B5B4F (primary-foreground)
- Border-radius: 9999px (rounded-full)
- Padding: px-6 py-2 (ou size="lg")
```

#### Outline
```css
- Background: transparent
- Border: 2px solid currentColor
- Hover: bg-muted
- Border-radius: 9999px
```

#### Ghost
```css
- Background: transparent
- Hover: bg-muted
- Pas de bordure
```

### Cards

```css
- Background: white
- Border: 1px solid border (rgba(200, 213, 185, 0.3))
- Border-radius: 1rem
- Padding: p-6
- Shadow: shadow-sm, hover:shadow-lg
- Transition: all 300ms
```

### Formulaires

#### Input / Textarea
```css
- Background: #FFF5E1 (input-background)
- Border: transparent, focus:ring-2 ring-primary
- Border-radius: 0.5rem
- Padding: px-3 py-2
```

#### Select
```css
- Style: Similar input
- Dropdown: Card style avec shadow-lg
```

#### Labels
```css
- Font-weight: 500 (medium)
- Color: foreground
- Margin-bottom: 0.5rem
```

### Badges

```css
- Padding: px-3 py-1
- Border-radius: 9999px (rounded-full)
- Font-size: text-sm
- Variants: default, outline, secondary, destructive
```

### Dialogs / Modals

```css
- Background: white
- Max-width: 2xl (32rem)
- Border-radius: 1rem
- Shadow: shadow-2xl
- Backdrop: blur + opacity
- Padding: p-6
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Desktop:** > 1024px (xl)

### Mobile (< 640px)

#### Header
- Logo + menu burger
- Navigation en drawer vertical
- CTA dans le drawer

#### Hero
- Stack vertical (texte puis image)
- Titre text-4xl
- Image sans rotation
- Boutons en colonne

#### Grilles
- 1 colonne pour tous les grids
- Cards pleine largeur

#### Footer
- 1 colonne, sections empilées

### Tablet (640px - 1024px)

#### Grilles
- 2 colonnes pour produits/réalisations
- Stats en 3 colonnes

#### Hero
- 2 colonnes maintenues
- Tailles réduites

### Desktop (> 1024px)

- Layout complet comme défini
- Max-width: 7xl (80rem) centré
- Padding: px-8

---

## ⚡ UX / Optimisation Conversion

### Hiérarchie Visuelle

1. **Titres:** Playfair Display, grandes tailles, espacement généreux
2. **CTAs:** Couleurs vives (primary), positions stratégiques
3. **Images:** Grandes, haute qualité, coins arrondis
4. **Espacement:** Généreux (py-20 sections, gap-8 grilles)

### Points de Conversion

1. **Hero:** 2 CTAs clairs (Commander + Réalisations)
2. **Bénéfices:** Rassurer sur la qualité
3. **Catégories:** Accès rapide catalogue
4. **CTA Finale:** Relance contact/devis
5. **Footer:** Liens navigation + contact

### Animations & Interactions

- **Hover states:** Scale, shadow, color transitions
- **Blobs animés:** Hero background (animation 7s)
- **Scroll effects:** Header backdrop-blur
- **Toast notifications:** Feedback utilisateur immédiat
- **Loading states:** Transitions douces (300ms)

### Accessibilité

- **Contrastes:** Texte #6B5B4F sur #FFFBF7 (WCAG AA)
- **Focus states:** Ring visible
- **Alt texts:** Images décrites
- **Labels:** Formulaires accessibles
- **Aria-labels:** Boutons icônes

---

## 🎨 Wireframes Simplifiés

### Page d'Accueil

```
┌─────────────────────────────────────────┐
│ HEADER [Logo] [Nav] [CTA]              │
├─────────────────────────────────────────┤
│                                         │
│  HERO SECTION                           │
│  ┌──────────┐  ┌────────────────┐     │
│  │  Texte   │  │     Image      │     │
│  │  + CTAs  │  │                │     │
│  └──────────┘  └────────────────┘     │
│                                         │
├─────────────────────────────────────────┤
│  BÉNÉFICES                              │
│  [Card] [Card] [Card] [Card]           │
├────────────────────────���────────────────┤
│  CATÉGORIES                             │
│  ┌────┐ ┌────┐ ┌────┐                 │
│  │Cat1│ │Cat2│ │Cat3│                 │
│  └────┘ └────┘ └────┘                 │
├─────────────────────────────────────────┤
│  CTA FINALE [Gradient Background]      │
├─────────────────────────────────────────┤
│ FOOTER [Info] [Nav] [Contact] [Social] │
└─────────────────────────────────────────┘
```

### Page Catalogue

```
┌─────────────────────────────────────────┐
│ HEADER                                   │
├─────────────────────────────────────────┤
│  Titre + Description                     │
│  [Tous] [Cat1] [Cat2] [Cat3]           │
├─────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │Prod1│ │Prod2│ │Prod3│              │
│  │[CTA]│ │[CTA]│ │[CTA]│              │
│  └─────┘ └─────┘ └─────┘              │
│  ┌─────┐ ┌─────┐ ┌─────┐              │
│  │Prod4│ │Prod5│ │Prod6│              │
│  └─────┘ └─────┘ └─────┘              │
└─────────────────────────────────────────┘

MODAL COMMANDE:
┌──────────────────────────┐
│ Détails Produit          │
│ ┌──────────────────────┐ │
│ │ Options:             │ │
│ │ - Couleur            │ │
│ │ - Taille             │ │
│ │ - Technique          │ │
│ │ - Texte              │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Informations client  │ │
│ └──────────────────────┘ │
│ [Prix Total]             │
│ [Annuler] [Commander]    │
└─────────��────────────────┘
```

### Page Admin

```
┌─────────────────────────────────────────┐
│ Dashboard Admin                          │
├─────────────────────────────────────────┤
│ [Stat1] [Stat2] [Stat3]                │
├─────────────────────────────────────────┤
│ [Commandes Tab] [Produits Tab]         │
├─────────────────────────────────────────┤
│ COMMANDES:                               │
│ ┌───────────────────────────────────┐  │
│ │ ID │ Client │ Produit │ Statut │  │  │
│ ├───────────────────────────────────┤  │
│ │ ... table rows ...               │  │
│ └───────────────────────────────────┘  │
│                                         │
│ PRODUITS:                               │
│ ┌─────┐ ┌─────┐ ┌─────┐              │
│ │Prod1│ │Prod2│ │Prod3│              │
│ │[Edit]│[Edit]│[Edit]│              │
│ └─────┘ └─────┘ └─────┘              │
└─────────────────────────────────────────┘
```

---

## 🚀 Technologies Utilisées

- **Framework:** React 18.3.1
- **Routing:** React Router 7.13.0
- **Styling:** Tailwind CSS 4.1.12
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Forms:** React Hook Form 7.55.0
- **Notifications:** Sonner
- **Animations:** CSS Animations + Motion potentiel

---

## 📝 Notes d'implémentation

### Fonts Loading
- Google Fonts via CDN (@import dans fonts.css)
- Fallbacks système: -apple-system, BlinkMacSystemFont

### Images
- ImageWithFallback component pour gestion erreurs
- Unsplash pour photos de qualité
- Lazy loading natif

### Forms
- React Hook Form pour gestion état
- Validation inline
- Toast notifications pour feedback

### État
- useState local pour interactions simples
- Pas de state management global (peut être ajouté avec Zustand/Redux si besoin)

### Backend Suggestion
- Actuellement: Mock data
- Recommandé: Supabase pour:
  - Auth admin
  - Database produits/commandes
  - Storage images
  - Real-time updates

---

## 🎯 Prochaines Étapes Suggérées

1. **Connexion Backend**
   - Intégrer Supabase pour persistence
   - Authentification admin
   - Upload images produits

2. **Améliorations UX**
   - Recherche produits
   - Filtres avancés
   - Panier d'achat complet

3. **SEO**
   - Meta tags dynamiques
   - Open Graph images
   - Sitemap

4. **Analytics**
   - Google Analytics
   - Tracking conversions
   - Heatmaps

5. **Performance**
   - Image optimization
   - Code splitting
   - Lazy loading routes

---

## 📞 Support

Pour toute question sur l'implémentation du design, référez-vous à:
- `/src/styles/theme.css` - Variables couleurs
- `/src/styles/index.css` - Fonts et animations
- Documentation Tailwind CSS v4
- Documentation Radix UI

---

**Version:** 1.0  
**Date:** Mars 2026  
**Auteur:** Design System Flocage Créatif
