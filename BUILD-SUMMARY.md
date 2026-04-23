# Dubai Coffee Directory — Build Summary

## Overview
Complete rebuild of dubai.fond.coffee — a coffee shop directory for Dubai with 25 cafes, full filtering, maps, dark mode, and ad slot infrastructure.

## Pages Built (35 total HTML files)

### Core Pages
- **index.html** — Curated home page with hero, search, stats bar, category cards, top 6 rated cafes, recently added (4), blog preview (3 articles), CTA section, and footer
- **listings.html** — Full listing page with sticky search, sidebar filters (category/area/rating), sort options, pagination (12 per page), and sponsored card at position 3
- **contact.html** — Add Your Cafe form, WhatsApp CTA, premium listing promotion, FAQ accordion (6 questions)

### Individual Cafe Pages (25)
Each page includes:
- Breadcrumb navigation
- Full-width hero image with overlay (name, rating, category)
- Quick action buttons (Get Directions, Call, Share)
- About section with description
- Tags display
- Opening hours table
- Leaflet map with marker at exact lat/lng coordinates
- Sidebar: Contact info card + Ad slot (300×600) + Owner CTA card
- Related cafes section (3 from same category)
- Schema.org JSON-LD structured data
- Open Graph meta tags

### Category Pages (4)
- category/specialty.html (14 cafes)
- category/roastery.html (7 cafes)
- category/cafe-restaurant.html (4 cafes)
- category/chain.html (1 cafe)

Each dynamically renders cafe cards from JS data.

### Premium Template
- **listing/premium-template.html** — Joe's Café Dubai as example
  - Full-width parallax hero with Premium Verified badge (gold)
  - Split-screen layout (image left, info right)
  - Video placeholder section
  - Digital menu: 3×3 grid with 9 menu items (names, prices, icons)
  - Opening hours + Leaflet map side-by-side
  - Analytics CTA section
  - Pricing tiers: Standard ($15/mo), Premium ($49/mo), Elite ($99/mo)
  - NO related/competitor section (premium perk)

## Technical Architecture

### File Structure
```
dubai-rebuild/
├── index.html
├── listings.html
├── contact.html
├── listing/ (25 cafe pages + premium template)
├── category/ (4 category pages)
├── assets/
│   ├── css/style.css (850+ lines)
│   ├── js/
│   │   ├── cafes-data.js (all 25 cafes as JS objects)
│   │   └── app.js (search, filter, pagination, theme, maps, nav)
│   └── images/ (25 listing images, 3 blog images, hero, favicon, OG)
```

### Features
- **No localStorage/sessionStorage** — all state in-memory JS variables
- **Dark/light mode toggle** via in-memory variable
- **Client-side filtering** with hash-based navigation (#category=roastery&page=2)
- **Search** filters by name, area, tags, and address
- **Sort** by Best Rated, Most Reviews, A–Z
- **Pagination** at 12 cards per page
- **Leaflet maps** on all individual listing pages with exact coordinates
- **Lucide icons** via CDN
- **Responsive** from 375px mobile to 2560px desktop
- **Mobile nav** slide-out sidebar with overlay
- **Mobile filter** modal overlay
- **Scroll-to-top** button with scroll threshold
- **Fade-in animations** via IntersectionObserver

### Design System
- Fonts: Playfair Display (headings) + Inter (body) via Google Fonts
- Colors: Warm cream (#FDFAF6), dark brown (#2C1A0E), gold accent (#C8860A)
- Dark mode: Deep brown (#1A0F08), cream text, gold accent preserved
- Border radius: 12px–16px on cards
- Soft warm shadows
- All external links use target="_blank" rel="noopener noreferrer"

### Ad Slot Specifications
- Leaderboard: 728×90 (320×50 mobile) between hero and categories
- In-feed: 300×250 after top rated section on home, at position 3 on listings
- Sidebar sticky: 300×600 on individual listing pages
- Footer banner: 728×90 on listing pages
- Styled with dashed border + "Advertisement" label

### SEO
- Schema.org JSON-LD (CafeOrCoffeeShop) on all listing pages
- Open Graph meta tags on all pages
- Semantic HTML with proper heading hierarchy
- Alt text on all images
