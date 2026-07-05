# Proposal: catalog-redesign

## Intent

Transform the Simbiosis Cocina catalog from a compact card-grid layout into a physical/magazine-style editorial catalog. Each product gets a full-width, two-column section with alternating image/info placement, immersive 3-photo display, and generous vertical spacing — matching the artisanal quality of the products themselves.

## Scope

### In Scope
- Magazine-style layout: 2-column alternating sections (photos|info / info|photos) per product
- Named 3-photo system (01.jpg main, 02.jpg secondary, 03.jpg tertiary) eliminating sequential probing
- Editorial typography: Playfair Display (Google Fonts) + system sans-serif
- Refined earthy palette with deeper contrast, generous whitespace, section dividers
- Category filter restyled for editorial look (underline/line-based active state)
- New optional `recomendacion` field in YAML schema
- WhatsApp per-product link repositioned within the new layout
- iFrame embed: review-only (no functional changes expected)

### Out of Scope
- Interactive image thumbnails or lightbox/gallery — deferred for future iteration
- Collage/masonry image layouts — vertical stack approach only
- Price/size data in WhatsApp pre-filled message — stays as-is
- Pagination or infinite scroll — single scroll remains

## Capabilities

> All 6 existing capabilities are MODIFIED (spec-level behavior changes):

| Capability | Change |
|-----------|--------|
| `product-data` | New optional `recomendacion` field; schema validation updated (not required) |
| `catalog-grid` | Complete rewrite: 2-column alternating sections, editorial spacing, 3 images |
| `category-filter` | Restyled for editorial look (pill → underline/line active state) |
| `image-loading` | Named 3-photo system (01/02/03) — no sequential probing, no N-image loop |
| `whatsapp-integration` | Per-product link repositioned; behavior unchanged |
| `embed-iframe` | No spec changes — review debounce timing only |

## Approach

1. **Layout**: Remove CSS Grid. Each product is a `<section>` with two `<div>` columns. Column order alternates via CSS class `layout-photos-first` / `layout-info-first`. Responsive: single column collapses to stacked on mobile.
2. **Images**: `loadImages(folder)` builds 3 URLs (`01.jpg`, `02.jpg`, `03.jpg`) directly. Uses `Image()` onload/onerror for existence check, no probe loop. Returns `{ main, secondary, tertiary }`. Missing images render placeholder.
3. **Typography**: Google Fonts `Playfair Display` loaded in `<head>`. CSS applies it to headings (h1-h3). Body stays system sans-serif. `font-display: swap` + Georgia/Times fallback.
4. **Styling**: Refactor `style.css` — remove card-grid classes, add section/separation/column classes. Increase vertical rhythm (2-4x spacing). Use horizontal rules (`<hr>`) between sections.
5. **Data**: Add `recomendacion` to `validateSchema()` as optional. Render after `conservacion` if present.
6. **Filters**: Restyle `.filter-bar button` — remove pill shape, use transparent background with bottom-border active indicator.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/css/style.css` | Major | Rewrite layout, typography, spacing, filter styles; remove grid/card CSS |
| `src/js/app.js` | Major | New DOM structure for 2-col sections, 3-image rendering, `recomendacion` field |
| `src/productos.yaml` | Moderate | Add optional `recomendacion` field per product |
| `src/index.html` | Minor | Add Google Fonts `Playfair Display` link in `<head>` |
| Image assets `src/img/*/` | Major | Rename to 01.jpg / 02.jpg / 03.jpg convention; remove extra/unnamed images |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking image naming (01/02/03) breaks existing folders | High | Document migration; test after rename; fallback placeholder |
| Google Fonts CDN failure | Low | `font-display: swap` + Georgia/Times fallback stack |
| Taller page may hit Tiendup iframe height limit | Unknown | Investigate limit during implementation; pagination as fallback |
| No card boundaries reduces visual separation | Low | Use `<hr>` dividers + alternating subtle background tints |

## Rollback Plan

1. `git checkout` the previous commit for `src/css/style.css`, `src/js/app.js`, `src/index.html`
2. Revert `src/productos.yaml` to remove `recomendacion` fields
3. Restore original image naming convention (rename back from 01/02/03)
4. Run a local open of `src/index.html` to verify card-grid layout renders correctly

## Dependencies

- Google Fonts CDN (`Playfair Display`) — loaded at runtime, no build step

## Success Criteria

- [ ] Each product renders as a 2-column section with alternating layout
- [ ] Each product displays up to 3 images (main large + 2 smaller below)
- [ ] `recomendacion` field renders when present, absent when missing
- [ ] Category filter works and has editorial-style active state
- [ ] WhatsApp per-product link opens correct `wa.me` URL
- [ ] Page has no internal scroll; postMessage reports accurate height
- [ ] Editorial typography loads with `font-display: swap` fallback
