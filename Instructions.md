# AGENTS.md — Catálogo de Productos Simbiosis

This file provides project-specific instructions for AI coding agents
building the Simbiosis product catalog page.

## Project Overview

Build a static product catalog page for Simbiosis Cocina, a plant-based
pastry business. The catalog loads product data from a YAML file at runtime
and renders it as a browsable, category-filtered page.

## Tech Stack

- Pure HTML + CSS + JavaScript (no frameworks, no build tools)
- js-yaml loaded from CDN for YAML parsing
- Decap CMS admin panel for non-technical editing
- Deploy to Netlify via Git (auto-deploy on push)

## Key Conventions

### File structure
```
simbiosis-catalog/
├── src/                    ← deployable source (published by Netlify)
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   ├── productos.yaml     ← product data (editable via admin panel)
│   ├── admin/
│   │   ├── index.html     ← Decap CMS admin entry point
│   │   └── config.yml     ← CMS field configuration
│   └── img/
│       └── {prefijo}-01.jpeg, {prefijo}-02.jpeg, {prefijo}-03.jpeg
├── netlify.toml           ← Netlify build configuration
├── openspec/              ← OpenSpec specs and changes
├── Instructions.md
└── README.md
```

### Product YAML structure
```yaml
productos:
  - nombre: "Product name"
    categoria: "Category"
    descripcion: |
      Multi-line description.
    presentaciones:
      - tamaño: "Grande"
        medida: "20cm"
        rinde: "6 porciones"
        precio: "$80.000"
    conservacion: |
      Storage instructions.
    observaciones: "Notable info (e.g. TACC notice)"
    carpeta_imagenes: "folder-name"
```

### Image loading
- Images are stored flat in `img/` with naming: `{carpeta_imagenes}-01.jpeg`, `{carpeta_imagenes}-02.jpeg`, `{carpeta_imagenes}-03.jpeg`.
- `.jpg` is tried first; if not found, `.jpeg` is attempted.
- If neither exists, a "Sin imagen" placeholder is shown.
- Images are uploaded via the Decap CMS admin panel media library.

### Styling — brand identity
- Brand green: `#4a6741` (titles, active filters, accents, WhatsApp button).
- Background: `#faf8f5` (warm off-white).
- Body text: `#333`; secondary text: `#555`, `#777`.
- Heading font: `'Playfair Display', Georgia, Times, serif` (editorial look).
- Body font: system sans-serif stack.

### Layout
- Editorial two-column layout: photo column (`flex: 3`) + info column (`flex: 2`).
- Alternating order via CSS classes `.layout-photos-first` / `.layout-info-first`.
- No borders or `<hr>` dividers between sections — spacing alone separates content.
- Product sections have `64px` vertical padding (`40px` on mobile).
- Max container width: `1200px`; section content max-width: `1100px`.

### Catalog intro
- A multi-paragraph editorial intro (`<div class="catalog-intro">`) renders
  between the header and the filter bar, styled with Playfair Display.
- No `<h1>` title — the parent site (Tiendup) provides its own heading.

### Filter bar
- Category filter buttons at the top with underline active state in brand green.
- No border/divider below the filter bar — clean separation via spacing.

### WhatsApp — per product
- Number: +54 9 11 3428-5333
- Each product has a solid green (`#4a6741`) CTA button that opens `wa.me`
  with a pre-filled "Hola, quiero consultar por: {producto}" message.
- No floating button.

### Language
- All user-facing text in Spanish (Argentina).
- Comments in code and YAML can be in Spanish.

### Deployment
- Deploy automatically via Git push to `master` branch on GitHub.
- Netlify auto-deploys on every push (configured in `netlify.toml`).
- Admin panel at `catalogo-simbiosis.netlify.app/admin/` for non-technical editing.
- Netlify Identity enabled for admin authentication.

### Admin Panel (Decap CMS)
- Access at `/admin/` — login with Netlify Identity credentials.
- Products are edited via visual form fields (no YAML editing required).
- Images uploaded through the media library are saved to `src/img/`.
- Image naming convention: `{carpeta_imagenes}-01.jpeg`, `-02.jpeg`, `-03.jpeg`.
- Each "Publish" in the admin creates a Git commit and triggers auto-deploy.

### Scroll behavior
- No category nav inside the iframe.
- The iframe height matches its full content — no internal scroll.
- The Tiendup page scrolls normally with no double scrollbars.

## Spec Documents

See `openspec/specs/` for persistent specifications and
`openspec/changes/` for active change proposals.
