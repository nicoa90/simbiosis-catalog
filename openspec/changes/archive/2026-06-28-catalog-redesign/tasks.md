# Tasks: Catalog Redesign — Editorial Magazine Layout

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~761 (CSS 450, JS 350, HTML 1, YAML 10) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Single PR with size:exception |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation (data model, fonts, image rename) | PR 1 | No deps, safe additive |
| 2 | CSS editorial layout + filter restyle | PR 1 | Depends on unit 1 font link |
| 3 | JS new render + image loading | PR 1 | Depends on unit 2 CSS classes |
| 4 | Sample data + verification | PR 1 | Depends on all above |

## Phase 1: Foundation — Data model, fonts, image setup

- [x] 1.1 Add `recomendacion` as optional field in `validateSchema()` in `src/js/app.js`
- [x] 1.2 Add Playfair Display `<link>` in `src/index.html` `<head>`
- [x] 1.3 Rename `src/img/*/` files to `01.jpg`/`02.jpg`/`03.jpg`; remove extras
- [x] 1.4 Update YAML header comment to reference 01/02/03 naming

## Phase 2: CSS — Editorial layout, typography, spacing

- [x] 2.1 Remove `.product-grid`, `.card`, `.card-image`, `.badge`, `.card-notes` from `src/css/style.css`
- [x] 2.2 Add `.product-section`, `.section-content`, `.photo-column`, `.info-column` with flexbox
- [x] 2.3 Add `.layout-photos-first` / `.layout-info-first` alternating classes
- [x] 2.4 Add `.subtitle`, `.conservacion`, `.recomendacion`, `.main-photo`, `.secondary-photos` styles
- [x] 2.5 Add `<hr>` divider styles, alternating bg tints, generous vertical spacing (2-4x)
- [x] 2.6 Restyle `.filter-bar button` — remove pill, add bottom-border active indicator
- [x] 2.7 Add responsive breakpoint <768px — stacked single column

## Phase 3: JS — New render functions, image loading, filter

- [x] 3.1 Replace `createCard()` with `createProductSection(product, index)` — 2-col editorial DOM
- [x] 3.2 Replace `renderGrid()` with `renderSections()` — uses `createProductSection`, appends `<hr>`
- [x] 3.3 Replace `probeImages()` with `loadImages(folder)` — 3 named files, `Promise.all`, returns `{main, secondary, tertiary}`
- [x] 3.4 Update `gImageCache` from `Map<folder, Map<index, url>>` to `Map<folder, {main, secondary, tertiary}>`
- [x] 3.5 Update `onFilterClick()` — change `.card` selector to `.product-section`
- [x] 3.6 Remove `gExtensions`, `imageIsLoadable()`, `getCachedPath()` — obsoleted by `loadImages`

## Phase 4: Polish — Sample data + manual verification

- [x] 4.1 Add `recomendacion` to 2-3 products in `src/productos.yaml`
- [x] 4.2 Manual verify: alternating layout, 3-image display, responsive 1024/768/375/320px
- [x] 4.3 Manual verify: filter show/hide, WhatsApp link in info column, recomendacion render
- [x] 4.4 Manual verify: missing image placeholders, Playfair fallback, iframe height report
