## Exploration: Catalog Page — Simbiosis Cocina

### Current State

The project is a skeleton. No `src/` directory exists. Only foundational files are present:

- `Instructions.md` — full project conventions (file structure, YAML format, image loading, WhatsApp, iFrame, styling, deployment)
- `openspec/config.yaml` — SDD project config with context, rules, and testing capabilities
- `openspec/changes/archive/` — empty
- `openspec/specs/` — empty (no main specs yet)
- `.atl/skill-registry.md` + `.skill-registry.cache.json` — skill registry index

No HTML, CSS, JS, YAML, or image files exist. The entire catalog page needs to be built from scratch.

### Affected Areas

- `src/index.html` — **Does not exist yet.** Entry point; loads CSS, JS, js-yaml CDN, and provides the DOM skeleton.
- `src/css/style.css` — **Does not exist yet.** All styles for the catalog (layout, cards, filters, responsive breakpoints, WhatsApp button).
- `src/js/app.js` — **Does not exist yet.** Main application logic: fetch YAML, parse, render products, category filtering, WhatsApp integration, postMessage auto-sizing.
- `src/productos.yaml` — **Does not exist yet.** Product data file; the single source of truth for all catalog content. Editable by non-technical users.
- `src/img/` — **Does not exist yet.** Image folders per product, named sequentially (01.jpg, 02.jpg, ...).

### Approaches

#### 1. Category Filtering Mechanism

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. Client-side JS data-attribute filtering** | Zero dependencies; instant response; matches Instructions spec; simple `querySelectorAll` + `display: none/block` | All data loaded upfront (fine for <100 products); no URL-based deep linking (acceptable since this is an iframe) | Low |
| B. Hash/query-based routing | Enables shareable filtered URLs | Overkill for iframe context; adds complexity with no benefit | Medium |

**Decision**: Approach A is the only viable option given the project constraints.

**Mechanism**: Render each product card with `data-categoria="CATEGORY_NAME"`. Category buttons toggle a `data-selected-categoria` attribute on the container. JS filters by matching data attribute. Active category gets a visual highlight.

#### 2. Image Loading Strategy

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. Sequential 404 probing** (Instructions-specified) | No image metadata in YAML; works on any static host; handles variable image counts per product | Latency penalty for each 404 request; visible broken-image flash before fallback kicks in | Low |
| B. Declare image count in YAML | Zero 404 requests; explicit control | Adds YAML field for non-technical users; more maintenance | Low |
| C. Image sprite / lazy-load with IntersectionObserver | Better performance for many images | Over-engineered for a catalog < 50 products | Medium |

**Decision**: Approach A as mandated by Instructions.md, but with two mitigations:
- Set `onerror` handler with a placeholder fallback image so broken images show a muted placeholder instead of a broken icon.
- Use a small placeholder blur-up placeholder on initial render (CSS background-color matching the earthy palette).

**Tradeoff to flag in design**: The 404-probing approach means the page will fire N HTTP requests per product (where N = number of images, each attempted sequentially until 404). For a catalog with 5 products × 3 images each, that's ~15 requests, each getting a 404 at the end. This is acceptable for a small catalog but worth noting.

#### 3. CSS Architecture

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. Single CSS file** (`css/style.css`) | Simple; one HTTP request; matches project convention | Single file can grow large | Low |
| B. Multi-file modular CSS | Separation of concerns | Unnecessary for a single-page catalog; additional HTTP requests | Low-Medium |

**Decision**: Single `css/style.css` per project convention.

**Structure**:
1. Reset + base typography (earthy, natural)
2. Layout: CSS Grid for product cards (auto-fill with minmax)
3. Product card styles (image, name, description, presentations, price, actions)
4. Category filter bar
5. WhatsApp floating button
6. Responsive breakpoints
7. Utility classes

**Responsive strategy** (mobile-first):
- Default (mobile): 1 column — `grid-template-columns: 1fr`
- `@media (min-width: 640px)`: 2 columns — `grid-template-columns: repeat(2, 1fr)`
- `@media (min-width: 1024px)`: 3 columns — `grid-template-columns: repeat(3, 1fr)`

#### 4. JS Organization

All logic in a single `js/app.js`:

```
app.js structure:
├── CONSTANTS (WhatsApp number, YAML path, CDN URLs)
├── State (categories[], selectedCategoria)
├── init()
│   ├── fetchYAML()
│   ├── parseYAML()
│   ├── extractCategories()
│   ├── renderCategoryFilters()
│   ├── renderProducts()
│   ├── initFilters()
│   ├── initWhatsAppFloating()
│   └── initIframeResize()
├── renderCategoryFilters() — builds filter buttons
├── renderProducts() — creates product card markup
├── applyFilter(categoria) — shows/hides cards
├── loadImages(carpeta, container) — sequential 404 probing
├── buildWhatsAppLink(productName) — generates wa.me URL
└── initIframeResize() — ResizeObserver + postMessage
```

#### 5. js-yaml CDN Integration

- Load from `https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js`
- Pin to version 4.x (avoid breaking changes)
- Load via synchronous `<script>` in `<head>` before `app.js`
- The YAML is fetched via `fetch()` at runtime, parsed with `jsyaml.load()`, then rendered as DOM

**Fallback**: Add `integrity` hash if possible, but not critical for a catalog page. CDN failure means the page shows "Cargando..." indefinitely — acceptable for this scope.

#### 6. WhatsApp Integration

**Per-product button**: Each card footer includes a WhatsApp icon/link:
```
https://wa.me/5491134285333?text=Hola%21%20Quiero%20consultar%20sobre%20{NOMBRE_PRODUCTO}
```

**Floating button**: Fixed-position button at bottom-right corner, always visible. Tapping or clicking opens a general chat to the business number.

**UX consideration**: Both buttons open in a new tab (`target="_blank"`). The floating button should be a simple wa.me link, not JavaScript-invoked (works without JS).

#### 7. iFrame postMessage Auto-sizing

**Mechanism**: Use `ResizeObserver` on the document body to detect height changes. Post `{ iframeHeight: document.documentElement.scrollHeight }` to `parent.window.postMessage()`.

**Edge cases**:
- Must wait for all images to load before first postMessage; use `Promise.allSettled()` on image load events.
- Re-observe on filter changes (category filtering changes the DOM height).
- Debounce resize events to avoid spamming postMessage (~300ms debounce).

**Important**: The Instructions mention the Tiendup editor can inject garbled text. The JS must be clean and minimal — no unnecessary dependencies.

### Recommendation

Build the catalog page following the conventions already defined in `Instructions.md`:

1. **Structure**: Single `index.html` loading `css/style.css`, `js/app.js`, and js-yaml from CDN
2. **Data**: `productos.yaml` with name, category, description, presentations, conservation, observations, and image folder reference
3. **Rendering**: JS fetches YAML at runtime, extracts unique categories, renders filter bar and product grid
4. **Images**: Sequential 404 probing (`01.jpg` → `02.jpg` → ...) with placeholder fallback
5. **Filtering**: JS-based with `data-categoria` attributes and `display` toggle
6. **Layout**: CSS Grid, mobile-first, 1/2/3 columns
7. **WhatsApp**: Per-product links + floating button
8. **iFrame**: ResizeObserver + postMessage with debounce
9. **No build tools**, no frameworks, no package.json

All approaches are straightforward with low complexity. No technical forks require further exploration.

### Risks

1. **Sequential 404 probing creates visible latency** — each product's images fire sequential requests until 404. For many products, this means dozens of wasted HTTP requests. Mitigation: placeholder background-color on load, and consider caching image existence via `Set()`.
2. **js-yaml CDN dependency** — if the CDN is down or blocked, YAML parsing fails completely. No fallback parser. Acceptable risk for a small business catalog but worth documenting.
3. **Tiendup embed fragility** — the Tiendup editor can inject garbage into the HTML snippet. The embed script must be minimal and pasted carefully. No direct mitigation from our side.
4. **Image folder naming** — `carpeta_imagenes` in YAML must match actual folder names in `img/`. A mismatch produces 404s for all images of that product. Validate during content creation.
5. **No error handling for malformed YAML** — non-technical user editing `productos.yaml` by hand may introduce syntax errors. The page should show a user-friendly error message rather than silently failing.

### Ready for Proposal

**Yes.** The exploration is complete. The project is well-defined with clear conventions in `Instructions.md`. All design decisions are straightforward with no blocking questions.

The orchestrator should:
- Name this change: `product-catalog`
- Proceed to **sdd-propose** with the scope: build the entire `src/` directory from scratch
- Next phases: proposal → spec → design → tasks → apply → verify → archive
- The change is self-contained and medium-sized; no chained PRs needed
