## Exploration: catalog-redesign

### Current State

The catalog is a **card-grid layout** with these characteristics:

1. **CSS Grid (1/2/3 col)**: Mobile-first responsive grid. Cards are compact, bordered, white-background containers with 12px border-radius, shadow, and constrained image aspect ratio (4:3).
2. **Single image per product**: `probeImages()` loads images sequentially from `01.{ext}` onward, incrementing until all extensions for an index return 404. Only the first found image is displayed.
3. **YAML schema**: 7 fields — `nombre`, `categoria`, `descripcion`, `presentaciones[]`, `conservacion`, `observaciones`, `carpeta_imagenes`. No `recomendacion` field exists.
4. **Content density**: Descriptions are brief (1-2 lines). Each card shows: image, name, category badge, short description, presentaciones list, observaciones, and a WhatsApp "Consultar" button.
5. **Visual identity**: Earthy/natural but card-focused — muted greens (#6b8f71, #4a6741), warm off-white (#faf8f5), rounded corners, subtle shadows.
6. **iFrame embed**: ResizeObserver + postMessage with 300ms debounce, `overflow:hidden` on `<html>` and `<body>`.

The current design prioritizes scanability and compactness — fit many products in a small viewport. The redesign asks for the opposite: generous spacing, editorial feel, immersive images, more detail per product.

### Affected Areas

| Area | Impact |
|------|--------|
| `src/css/style.css` | **Major** — complete rewrite from card-grid to vertical-stack editorial layout. Typography system, spacing, image sizing, full-width sections. |
| `src/js/app.js` | **Major** — DOM structure changes (no more `.card`/`.product-grid`), 3-image rendering per product, new `recomendacion` field rendering, different layout assembly. |
| `src/productos.yaml` | **Moderate** — new `recomendacion` field per product. Descriptions may grow. `carpeta_imagenes` stays but image semantics change (named 01/02/03 vs. sequential probing). |
| `src/index.html` | **Minimal** — may need Google Fonts or font-face loading for editorial typography. |
| Image assets `src/img/*/` | **Moderate** — 3 named images per product (01=main, 02=secondary, 03=tertiary) instead of N sequential images. |
| `openspec/specs/*/spec.md` | **All 6 specs affected** — grid, image-loading, product-data specs need revision; category-filter and embed-iframe need review; whatsapp-integration minimal impact. |

### Approaches

#### 1. Layout: Card Grid → Vertical Stack

- **Option A: Simple single-column block layout**
  - Remove CSS Grid, use a single `<section>` per product with `width: 100%`.
  - Pros: Simplest change, minimal CSS restructure.
  - Cons: Misses the editorial feel — no visual rhythm, just stacked cards without the card borders.
  - Effort: Low

- **Option B: Magazine/editorial full-width sections**
  - Each product is a full-width `<section>` with generous padding, alternating image placement (left/right for desktop), full-bleed hero image at top of each section, clear section dividers.
  - Pros: Feels like a physical catalog. Strong visual hierarchy. Editorial impact.
  - Cons: More CSS, more complex responsive behavior, taller page (more postMessage traffic acceptable but larger payload).
  - Effort: Medium

- **Option C: Hybrid — vertical stack with content zones**
  - Full-width sections but not alternating. Image zone at top (hero), then info zone below. Clean separator between products.
  - Pros: Predictable layout, easier responsive behavior, still physical-catalog feel.
  - Cons: Less visual variety than magazine alternating.
  - Effort: Medium

- **Recommendation: Option B with Option C fallback.** Start with editorial full-width sections; if the alternating layout proves too complex for responsive, consider Option C as a simpler approach with similar feel.

#### 2. Image Loading: Sequential Probing → Named 3-Photo System

- **Option A: Known filenames, no probing**
  - `01.jpg` = main/primary, `02.jpg` = secondary, `03.jpg` = tertiary. Always try all three. No sequential probing loop — just build 3 URLs and handle missing gracefully.
  - Pros: Eliminates the sequential probing entirely (simpler code, faster load). Deterministic — you know exactly which image is which. Cleaner to document.
  - Cons: Requires exactly 3 images per product (or handling 1-2 gracefully). Existing image folders with single images need renaming.
  - Effort: Low

- **Option B: Hybrid — probe up to 3, cache as named**
  - Keep the probing loop but cap at 3, and return a structured object `{ main, secondary, tertiary }` instead of a flat array.
  - Pros: Backward compatible with existing folders (many may have only 1-2 images). Probe order stays the same.
  - Cons: Still makes sequential requests. Slower. Heavier code. Still need to name-semantic the results after finding them.
  - Effort: Medium

- **Recommendation: Option A.** The redesign is the right moment to break compatibility. Document the naming convention clearly in YAML comments and AGENTS.md. Simpler, faster, more predictable.

#### 3. New Data Field: `recomendacion`

- **Approach: Single approach, no real alternatives.**
  - Add `recomendacion: string` (optional) to the YAML schema.
  - Update `validateSchema()` — `recomendacion` is NOT required (existing products may not have it).
  - Render it in the product section as a "Recomendación" block, probably after `conservacion`.
  - Update the product-data spec accordingly.
  - Effort: Low

#### 4. Visual Approach: Magazine/Editorial Style

- **Typography**: Load a high-quality serif font for headings (e.g., Playfair Display, Cormorant Garamond) and keep a clean sans-serif for body (or use a refined serif/text pairing like EB Garamond body + Playfair headings). Google Fonts CDN.
- **Spacing**: Generous — 3-4rem section padding, 2rem between content blocks inside a product. Double current spacing.
- **Image sizing**: Near-full-bleed width (92-100% of container), taller aspect ratio (3:2 or 16:9 instead of 4:3). Multiple images stacked or arranged in a gallery block.
- **Color palette**: Keep earthy tones but introduce deeper contrast — dark charcoal text, cream/ivory backgrounds, muted green accents. More white space, less "boxed-in" feeling.
- **Section separators**: Thin horizontal rules, generous margins between products, maybe subtle typographic ornaments.

#### 5. WhatsApp Integration Changes

- **Minimal changes needed.**
  - Per-product "Consultar" button stays but may be repositioned (after recomendación block, not inside a card).
  - The pre-filled message could be enhanced to include more context (e.g., size/price from the product), but that depends on user interaction choices.
  - Floating button stays unchanged.
  - Effort: Low

#### 6. iFrame / postMessage Behavior

- **No significant changes needed.**
  - The page will be taller (more vertical content). The ResizeObserver + postMessage still works — it just sends larger height values.
  - `overflow:hidden` stays — no internal scroll regardless of height.
  - The 300ms debounce may need review if image loading causes many rapid height changes (3 images loading async instead of 1). The debounce handles this correctly already.
  - Effort: Low (review only)

#### 7. Approach for Showing 3 Images Per Product

- **Option A: Vertical image stack**
  - Main image full-width. Secondary and tertiary smaller below, in a row or stacked.
  - Pros: Simple responsive behavior. Natural reading flow (top to bottom). Works on all viewports.
  - Cons: Taller page. Less visual impact for secondary images.
  - Effort: Low

- **Option B: Hero + thumbnail strip**
  - Large main image (hero). Below or beside it, a horizontal row of 2 smaller thumbnails that could be clickable (future enhancement).
  - Pros: Editorial feel. Familiar pattern from e-commerce. Main image gets full attention.
  - Cons: More JS needed for click handling (if interactive). Thumbnails on mobile need careful sizing.
  - Effort: Medium

- **Option C: Collage/masonry layout**
  - Main image large left/center, secondary and tertiary as smaller insets or arranged in an asymmetric grid.
  - Pros: Most "physical catalog" feel. High visual impact.
  - Cons: Complex responsive behavior. Harder to maintain. May not fit editorial vertical-stack flow.
  - Effort: High

- **Recommendation: Option A for the first iteration.** Vertical image stack (main full-width, secondary + tertiary as a 2-column row below). Simple, editorial, responsive. Can evolve to Option B later if interactive thumbnails add value.

### Recommendation

**Proceed with the catalog-redesign using this approach:**

1. **Layout**: Magazine-style full-width sections (Option B/C hybrid) — each product is a full-width `<section>` with generous vertical spacing, visible separator between products, no card boxes.
2. **Images**: Named 3-photo system (01=main, 02=secondary, 03=tertiary) — eliminate sequential probing entirely. Main image near-full-bleed. Secondary + tertiary as a 2-column row below.
3. **Data**: Add `recomendacion` (optional string). Update schema validation and spec. Keep existing fields.
4. **Typography**: Google Fonts — Playfair Display for headings, system sans-serif for body (or EB Garamond for a full serif editorial look).
5. **Spacing**: 2-4x current spacing. Full width (max-width may increase or be removed).
6. **iFrame**: No changes needed — postMessage handles taller content. Review debounce timing.
7. **WhatsApp**: Minimal changes — reposition per-product link. Pre-filled message may stay as-is.
8. **Filters**: Keep category filter bar but restyle for editorial look (underline active state instead of pill shape).

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Taller page increases postMessage traffic** | High | Low | ResizeObserver debounce already handles this. Test with 20+ products. |
| **Breaking change: named 3-photo system breaks existing image folders** | High | Medium | Document clearly. Rename existing images. Add migration note. |
| **Editorial fonts from Google Fonts may fail to load** | Low | Medium | Use `font-display: swap`. Include good fallback stack (Georgia, Times). |
| **Page becomes very tall on mobile (20+ products)** | Medium | Low | Acceptable — iFrame grows accordingly. No scroll inside iframe. |
| **Removing card boundaries may reduce visual separation** | Low | Medium | Use generous whitespace, horizontal rules, alternating subtle background tints between products. |
| **Tiendup iFrame height limit?** | Unknown | High | Investigate if Tiendup has a max iframe height. If so, consider pagination or scroll within a max-height iframe. |

### Ready for Proposal

**Yes.** The exploration is complete. All areas are analyzed, risks identified, approaches evaluated with clear recommendations. The orchestrator should tell the user:

> The investigation is ready. The redesign transforms the catalog from a card-grid to a full-width editorial/magazine layout. Key decisions to confirm: (1) Named 3-photo system vs. keep probing, (2) Magazine alternating sections vs. simpler vertical stack, (3) Vertical image stack vs. hero+thumbnails, (4) Font choice (Playfair + system vs. full serif pair). The biggest risk is the breaking change to image naming — clear migration docs needed.
