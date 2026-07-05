# Proposal: Product Catalog Page

## Intent

Build a static, embeddable product catalog for Simbiosis Cocina that loads YAML at runtime and renders a browsable, category-filtered grid. Replaces the existing catalog with a clean, YAML-driven solution.

## Scope

### In Scope

- YAML-driven product data (4–6 sample items)
- Responsive CSS Grid (1/2/3 col, mobile-first)
- JS category filtering with active state
- WhatsApp per-product links + floating button
- Sequential image loading with placeholder fallback
- iFrame auto-sizing (ResizeObserver + postMessage)
- Earthy/natural visual identity matching simbiosiscocina.com

### Out of Scope

- Server-side rendering or build pipeline
- Shopping cart or checkout
- URL-based filter state (iframe context)
- Image optimization
- Multi-language support

## Capabilities

### New Capabilities

- `product-data`: YAML schema, fetch, parse, and expose product array
- `catalog-grid`: Responsive CSS Grid rendering of product cards
- `category-filter`: JS filter bar with data-attribute show/hide
- `whatsapp-integration`: wa.me per-product links + floating button
- `embed-iframe`: ResizeObserver + debounced postMessage for Tiendup embed
- `image-loading`: Sequential 404 probing with placeholder fallback

### Modified Capabilities

None — first change, no existing specs.

## Approach

Static HTML/CSS/JS with js-yaml CDN. `app.js` fetches `productos.yaml`, renders filter bar and product grid. CSS Grid responsive (1/2/3 col). Filtering via `data-categoria` attribute toggle. WhatsApp via `wa.me` URLs. iFrame auto-sizing via ResizeObserver → postMessage with 300ms debounce. Images loaded sequentially until 404 with CSS placeholder fallback.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/index.html` | New | Entry point, loads CSS/JS/js-yaml CDN |
| `src/css/style.css` | New | All styles (reset, grid, cards, filters, WhatsApp, responsive) |
| `src/js/app.js` | New | All application logic (fetch, render, filter, WhatsApp, resize) |
| `src/productos.yaml` | New | Product data with 4–6 sample items |
| `src/img/` | New | Product image directories |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sequential 404 probing creates visible latency | Medium | Placeholder background on load; cache probed paths in `Set()` |
| js-yaml CDN outage breaks parsing | Low | Pin v4.x; "Cargando..." fallback acceptable for static catalog |
| Malformed YAML from manual edits | Low | `try/catch` with user-friendly error message in Spanish |
| Tiendup editor garbles embed script | Medium | Minimal snippet; document exact paste instructions |
| Image folder name mismatch in YAML | Low | Validate at content creation; document in YAML comments |

## Rollback Plan

Restore previous `src/` from git. Fully static — no database, API, or build artifacts. Re-deploy `src/` folder to Netlify.

## Dependencies

None. js-yaml loaded from CDN (jsdelivr, pinned v4).

## Success Criteria

- [ ] Grid renders with correct category distribution from YAML
- [ ] Filter buttons show/hide products correctly
- [ ] WhatsApp per-product links generate correct `wa.me` URLs
- [ ] Floating WhatsApp button visible and clickable on all viewports
- [ ] Responsive grid adapts: 1 col (mobile), 2 col (tablet), 3 col (desktop)
- [ ] Images load sequentially with placeholder fallback on 404
- [ ] iFrame height auto-syncs on load and after filter changes
- [ ] No JS errors in Chrome, Firefox, Safari (latest 2 versions)
