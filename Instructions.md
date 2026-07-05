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
- Deploy to Netlify via drag-and-drop

## Key Conventions

### File structure
```
simbiosis-catalog/
├── src/                    ← deployable source (drag this to Netlify)
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   ├── productos.yaml     ← product data (editable by non-technical user)
│   └── img/
│       └── {carpeta_imagenes}/ ← images named 01.jpg, 02.jpg...
├── openspec/               ← OpenSpec specs and changes
├── .opencode/              ← OpenCode skills and commands
├── AGENTS.md
├── INSTRUCTIONS.md
└── ROADMAP.md
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
- Images are stored in `img/{carpeta_imagenes}/` with three fixed names:
  `01.jpg`/`01.jpeg`, `02.jpg`/`02.jpeg`, `03.jpg`/`03.jpeg`.
- `.jpg` is tried first; if not found, `.jpeg` is attempted.
- If neither exists, a "Sin imagen" placeholder is shown.

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
- Deploy by dragging the `src/` folder to **Netlify** (drag-and-drop).
- The catalog runs as an independent static site on Netlify.
- It is embedded on `simbiosiscocina.com/catalogo` via a **Tiendup custom page**
  with an `<iframe>` pointing to the Netlify URL.
- The catalog page JS uses `postMessage()` + `ResizeObserver` to send its
  height to the parent frame on load and on resize, so the iframe auto-sizes.
- Tiendup embed snippet (pasted in "Código HTML" section — **must be clean JS,
  Tiendup's editor can inject garbled text that breaks the script**):
  ```html
  <iframe src="https://catalogo-simbiosis.netlify.app"
          style="width:100%; border:none;"
          id="catalog-iframe"></iframe>
  <script>
  window.addEventListener('message', function(e) {
    if (e.data && e.data.iframeHeight) {
      document.getElementById('catalog-iframe').style.height = e.data.iframeHeight + 'px';
    }
  });
  </script>
  ```

### Scroll behavior
- No category nav inside the iframe.
- The iframe height matches its full content — no internal scroll.
- The Tiendup page scrolls normally with no double scrollbars.

## Spec Documents

See `openspec/specs/` for persistent specifications and
`openspec/changes/` for active change proposals.
