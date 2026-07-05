# Tasks: Product Catalog

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~620–880 (greenfield: 5 files) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation + Core — PR 2: Integration + Polish |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | YAML data + HTML structure + CSS grid + JS fetch/render/filter/images | PR 1 | Base = main. Self-contained catalog with filter. |
| 2 | WhatsApp links + iFrame postMessage + responsive polish + placeholder | PR 2 | Base = PR 1 branch. Adds integration layer on top of PR 1. |

## Phase 1: Foundation

- [x] 1.1 Create `src/productos.yaml` with 4–6 products matching the schema (nombre, categoria, descripcion, presentaciones, conservacion, observaciones, carpeta_imagenes)
- [x] 1.2 Create `src/img/` subdirectories per `carpeta_imagenes` with `.gitkeep` placeholder
- [x] 1.3 Create `src/index.html` — HTML5 document, js-yaml v4 CDN, `<link>` to CSS, `<script>` to JS, `<div id="app">` skeleton
- [x] 1.4 Create `src/css/style.css` — CSS reset, mobile-first grid (1/2/3 col at 640/1024px), card/button/float styling, earthy palette (#faf8f5, #6b8f71)

## Phase 2: Core Implementation

- [x] 2.1 Implement `initCatalog()` — fetch `productos.yaml`, `jsyaml.load()`, `validateSchema()`, expose products array; handle 404/parse/network errors
- [x] 2.2 Implement `deriveCategories()` + `renderFilterBar()` — unique categories + "Todas", click handlers, `active` class toggle, `data-categoria` show/hide
- [x] 2.3 Implement `renderGrid()` + `createCard()` — render `<article class="card" data-categoria="...">` with h3, badge, description, presentaciones list, image
- [x] 2.4 Implement `probeImages()` — sequential `new Image()` probing (jpg→jpeg→png→webp), `Map<carpeta, string[]>` cache, "Sin imagen" placeholder div

## Phase 3: Integration

- [x] 3.1 Add per-product WhatsApp "Consultar" `<a>` in `createCard()` — `wa.me/5491134285333?text=...` with URI-encoded product name, `target="_blank"`
- [x] 3.2 Add floating WhatsApp `<a class="whatsapp-float">` — `position: fixed`, bottom-right offsets, `z-index: 1000`, SVG/Unicode icon
- [x] 3.3 Implement `initResizeObserver()` — ResizeObserver on body, 300ms debounce, `postMessage({ iframeHeight })`, `overflow: hidden` guard, MutationObserver fallback

## Phase 4: Polish

- [x] 4.1 Add "No hay productos en esta categoría" message for empty filter results, "No hay productos disponibles" for empty data
- [x] 4.2 Add 80px bottom padding on body to clear WhatsApp float, 320px viewport overflow safeguards
- [x] 4.3 Verify `overflow: hidden` on `<html>` prevents internal scroll; edge cases (no parent window, ResizeObserver unsupported)
