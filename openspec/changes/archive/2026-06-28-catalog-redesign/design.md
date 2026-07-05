# Design: Catalog Redesign — Editorial Magazine Layout

## Technical Approach

Replace the CSS Grid card layout with full-width editorial `<section>` elements, each containing two columns (photos | info) that alternate per product via CSS classes. Image loading shifts from sequential numeric probing (flexible N images, multiple extensions) to a fixed 3-photo named system (`01.jpg`, `02.jpg`, `03.jpg`) with parallel existence checks. Filtering, WhatsApp links, and iframe resizing remain structurally unchanged but target the new DOM selectors.

No build tools, no framework — stays pure HTML/CSS/JS. Google Fonts loaded via CDN `<link>` in `<head>`.

## Architecture Decisions

### Decision: DOM Structure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `<section>` per product (heading-level semantic) | Matches editorial intent, screen-reader friendly, clean separation | **Chosen** |
| Keep `<article>` cards inside a grid | Requires layout hacks, semantic mismatch with full-width sections | Rejected |
| Flat `<div>` hierarchy | Works but loses semantic structure | Rejected |

### Decision: Alternating Column Order

| Option | Tradeoff | Decision |
|--------|----------|----------|
| CSS class per section (`layout-photos-first` / `layout-info-first`) | Simple toggle via `index % 2`, no JS reordering | **Chosen** |
| CSS `:nth-child(even)` selector | Works but couples layout to source order, harder to debug | Rejected |
| Flexbox `order` property | Fragile with responsive collapse | Rejected |

### Decision: Image Loading — Named 3-Photo

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Fixed `01.jpg`, `02.jpg`, `03.jpg` with `Promise.all` | Known count enables parallel loading, no extension probing | **Chosen** |
| Keep sequential probing | Unknown N, multiple extensions per num — unnecessary HTTP roundtrips | Rejected |
| Only `01.jpg` (single-image approach) | Loses editorial 3-photo display | Rejected |

### Decision: Typography Loading

Google Fonts `Playfair Display` via `<link>` in `<head>` with `font-display: swap`. Fallback stack: `Georgia, Times, serif`. Body stays system sans-serif. No JS font loading — CDN link is sufficient and matches existing no-build pattern.

### Decision: Filter Restyling

Active state uses a `2px` bottom border (underline indicator) instead of the current pill background. The `.filter-bar button` removes `border-radius`, `border: 2px`, and active background fill — replaced by transparent background + bottom border on `.active`.

## Data Flow

```
initCatalog()
  → fetch('productos.yaml')
  → jsyaml.load()
  → validateSchema()         [recomendacion now optional]
  → renderFilterBar()
      → deriveCategories()
      → create <nav> with <button>s (editorial style)
  → renderGrid(products)
      → for each product at index:
          → createProductSection(product, index)
              → loadImages(product.carpeta_imagenes)
                  → gImageCache check
                  → cache miss:
                      Promise.all([
                        checkImage(folder+'/01.jpg'),
                        checkImage(folder+'/02.jpg'),
                        checkImage(folder+'/03.jpg')
                      ])  →  { main, secondary, tertiary }
                  → cache hit: return cached result
              → build DOM: section > .section-content(.layout-photos-first|layout-info-first)
                  > .photo-column (main + secondary row)
                  + .info-column (h2, subtitle, desc, presentaciones, wa-link, conservacion, recomendacion)
              → append <hr> after section
  → initResizeObserver()
```

### Filter interaction (unchanged flow):

```
onFilterClick(category)
  → toggle .active on .filter-bar button
  → toggle .hidden on .product-section elements
  → sendHeight()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/index.html` | Modify | Add `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">` in `<head>` |
| `src/js/app.js` | Modify | Replace `createCard()` → `createProductSection()`, `probeImages()` → `loadImages()`, update filter selectors (`.product-section`), add `recomendacion` to `validateSchema()` |
| `src/css/style.css` | Modify | Remove `.product-grid`, `.card`, `.card-image`, `.badge` styles. Add `.product-section`, `.section-content`, `.photo-column`, `.info-column`, `.main-photo`, `.secondary-photos`, `.subtitle`, `.conservacion`, `.recomendacion`, editorial spacing, `<hr>` divider, restyled `.filter-bar` button |
| `src/productos.yaml` | Modify | Add optional `recomendacion` field to 2-3 products |
| Image folders `src/img/*/` | Modify | Rename to `01.jpg` / `02.jpg` / `03.jpg`; remove extra/unnamed files |

## Interfaces / Contracts

### loadImages(folder) — replaces probeImages()

```javascript
/**
 * Load exactly 3 named images for a product folder.
 * @param {string} folder - e.g. 'torta-chocolate'
 * @returns {Promise<{main: string, secondary: string, tertiary: string}>}
 *   Resolved paths or empty string per slot.
 */
async function loadImages(folder) { ... }
```

### imageCache — replaces Map<number, string> map-in-map

```javascript
// Key: folder name   Value: { main, secondary, tertiary }
const gImageCache = new Map(); // Map<string, {main, secondary, tertiary}>
```

### createProductSection(product, index) — replaces createCard()

```javascript
/**
 * Create an editorial product section with 2-column alternating layout.
 * @param {Object} product - Validated product data
 * @param {number} index - Index for alternating layout
 * @returns {HTMLElement} section.product-section
 */
function createProductSection(product, index) { ... }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual — Visual | Alternating layout, 3-image display, responsive collapse | Open at 1024px, 768px, 375px, 320px in Chrome DevTools |
| Manual — Functional | Filter shows/hides sections, WhatsApp link opens wa.me, `recomendacion` renders | Click each filter, inspect WA link, add/remove field in YAML |
| Manual — Fallbacks | Missing images render placeholder, no broken `<img>` | Delete 02.jpg/03.jpg from a folder, verify placeholder renders |
| Manual — Font | Playfair Display loads with fallback | DevTools → Network → confirm 200 on fonts.googleapis.com |

## Open Questions

- [ ] Confirm acceptable iframe height for the taller page with Tiendup embed (spec says investigate during implementation)
- [ ] Should `observaciones` display location change? Currently it's a field used but not mentioned in catalog-grid specs — clarify if it stays in the info column
