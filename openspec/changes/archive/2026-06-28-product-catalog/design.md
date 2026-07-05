# Design: Product Catalog Page

## Technical Approach

Single-page static catalog rendered at runtime from `productos.yaml`. A single `app.js` orchestrates fetch → parse → validate → render grid → attach filters → enable WhatsApp links → start iFrame resize observer. No modules, no build step. All behavior lives in one file because scope is small (6 capabilities) and the deploy model (drag `src/` to Netlify) rewards zero tooling. CSS is a single mobile-first stylesheet. The YAML is the single source of truth — non-technical users edit products without touching markup.

## Architecture Decisions

| Decision | Options Considered | Choice & Rationale |
|----------|-------------------|--------------------|
| JS file organization | Single file vs. one per capability | **Single `app.js`**. No bundler means manual `<script>` ordering per file, which is fragile. Total logic is under 400 lines — clean separation via comment sections suffices. |
| CSS layout | CSS Grid vs. Flexbox with wrapping | **CSS Grid**. The layout is a strict 1/2/3 column grid, not a flex distribution. Grid handles responsive columns natively with `grid-template-columns` at breakpoints. |
| Image probing | `new Image()` onload/onerror vs. fetch HEAD | **`new Image()`**. The browser handles caching and HTTP natively. Fetch HEAD only confirms existence but not that the image decodes correctly. Image probing is existing browser capability. |
| Filter mechanism | `data-categoria` show/hide vs. re-render grid | **`data-categoria` attribute toggle**. Simple CSS `display: none` avoids re-creating DOM nodes (images stay loaded, cached paths reused). |
| Image path cache | `Map<carpeta, Map<number, string>>` vs. flat Set | **Nested Map keyed by folder → index**. Scoped per product folder as specs require, bounded by total images. |
| iFrame height source | `document.body.scrollHeight` vs. `ResizeObserver` | **ResizeObserver with `scrollHeight` fallback**. ResizeObserver fires on any DOM change automatically. Falls back to `scrollHeight` when unsupported. Debounced at 300ms. |

## Data Flow

```
Page Load
   │
   ▼
fetch('productos.yaml') ──404──► "Error al cargar el catálogo"
   │
 200▼
jsyaml.load(rawText) ──error──► "Error al leer los datos del catálogo"
   │
   ▼
validateSchema(parsed) ──fail──► "No hay productos disponibles"
   │
   ▼
deriveCategories(products) ──► ["Todas", ...unique]
   │
   ▼
renderFilterBar(categories) ──► attach click handlers
renderGrid(products) ────────► forEach product → createCard()
                                    │
                                    ▼
                              probeImages(folder, index) → cache path | placeholder
                                    │
                                    ▼
                              attachWhatsAppLink(card, nombre)
   │
   ▼
ResizeObserver(document.body) ──300ms──► postMessage({ iframeHeight })
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/index.html` | Create | HTML5 document, loads CSS, js-yaml CDN (v4), and `app.js` |
| `src/css/style.css` | Create | Reset, CSS Grid (1/2/3 col), cards, filter bar, WhatsApp float, responsive breakpoints, placeholder |
| `src/js/app.js` | Create | All logic in comment-sectioned single file |
| `src/productos.yaml` | Create | 4–6 sample products with required schema fields |
| `src/img/` | Create | Image folder structure per product's `carpeta_imagenes` |

## Interfaces / Contracts

### YAML Schema (validated at runtime)

```yaml
productos:
  - nombre: string (required, non-empty)
    categoria: string (required, non-empty)
    descripcion: string (optional)
    presentaciones:
      - tamaño: string
        medida: string
        rinde: string
        precio: string
    conservacion: string (optional)
    observaciones: string (optional)
    carpeta_imagenes: string (required, non-empty)
```

### JS Function Signatures

```js
async function initCatalog(): Promise<void>
function validateSchema(data: unknown): Product[]
function deriveCategories(products: Product[]): string[]
function renderFilterBar(categories: string[]): void
function onFilterClick(category: string): void
function renderGrid(products: Product[]): void
function createCard(product: Product): HTMLElement
async function probeImages(folder: string): Promise<string[]>
function getCachedPath(folder: string, index: number): string | undefined
function makeWhatsAppUrl(productName: string): string
function initResizeObserver(): void
function sendHeight(): void
```

### HTML Structure Outline

```
<div id="app">
  <header>           ← Branding + intro text (optional)
  <nav id="filtros"> ← Dynamic filter buttons
  <div id="grid">    ← Product cards (CSS Grid)
    <article class="card" data-categoria="Tortas">
      <img src="...">
      <h3>nombre</h3>
      <span class="badge">categoria</span>
      <p>descripcion</p>
      <ul class="presentaciones">...</ul>
      <a class="whatsapp-link" href="wa.me/..." target="_blank">Consultar</a>
    </article>
  </div>
  <a class="whatsapp-float" href="wa.me/..." target="_blank">📞</a>
</div>
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual | YAML fetch, parse, validation | Open page in browser, check console for errors, inspect rendered cards |
| Manual | Filter show/hide | Click each category, verify correct cards visible, "No hay productos" message on empty |
| Manual | WhatsApp links | Inspect `href` attribute on per-product and floating links |
| Manual | Image probing | Monitor Network tab for sequential requests, verify placeholder on 404 |
| Manual | Responsive grid | Resize browser to 375px / 768px / 1440px, verify column count |
| Manual | iFrame auto-size | Open page standalone, verify `body.style.overflow = 'hidden'`, no scrollbar |
| Cross-browser | All above | Chrome, Firefox, Safari latest 2 versions |

## Migration / Rollout

No migration required — greenfield project. First deploy: drag `src/` to Netlify, configure custom domain. Embed in Tiendup via iframe snippet (see `Instructions.md`).

## Open Questions

- [ ] Floating WhatsApp icon: use an SVG inline, a Unicode symbol, or Font Awesome from CDN? (SVG inline preferred — no extra request, matches earthy aesthetic)
- [ ] Should `src/img/` contain actual images or just a `.gitkeep` placeholder for the developer to add? (Suggest actual images for demo, documented in YAML comments)
