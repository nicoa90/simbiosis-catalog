# image-loading Specification

## Purpose

Defines the sequential 404 probing algorithm for loading product images across supported extensions, placeholder fallback on failure, and request caching to minimize redundant network requests.

## Requirements

### Requirement 1: Sequential Numeric Probing

The system MUST probe images sequentially starting from `01.{ext}` within the product's `carpeta_imagenes` folder, incrementing the number until all extensions for a number return 404.

#### Scenario: Two images load successfully

- GIVEN `img/tortas/01.jpg` and `img/tortas/02.jpg` exist
- WHEN the system probes `01.jpg` → 200 → displays it
- AND probes `02.jpg` → 200 → displays it
- THEN probing continues to `03.jpg`

#### Scenario: All extensions fail on number 03

- GIVEN `01.jpg` and `02.jpg` exist
- WHEN the system probes `03.jpg` → 404, `03.jpeg` → 404, `03.png` → 404, `03.webp` → 404
- THEN probing stops for this product folder
- AND a placeholder is rendered for position 03

#### Scenario: Different extension succeeds

- GIVEN `01.jpg` returns 404
- WHEN the system probes `01.jpeg` → 404, `01.png` → 200
- THEN the PNG image is displayed
- AND no further extensions are probed for number 01

### Requirement 2: Extension Probe Order

The system MUST probe extensions in this exact order: jpg, jpeg, png, webp.

#### Scenario: Extensions probed in order

- GIVEN only `01.webp` exists
- WHEN the system probes for number 01
- THEN jpg fails (404), jpeg fails (404), png fails (404)
- AND webp succeeds (200) and is displayed
- AND the webp is the final displayed image

#### Scenario: Multiple extensions return 200

- GIVEN both `01.jpg` and `01.png` exist on the server
- WHEN the system probes for number 01
- THEN jpg succeeds (200) first and is displayed
- AND png is never probed because probing stops at the first success

### Requirement 3: Placeholder Fallback

When all extensions for a number return 404, the system MUST render a CSS placeholder element, not a broken image icon.

#### Scenario: Placeholder renders after all extensions fail

- GIVEN probing exhausted all extensions for position 03
- WHEN no image is available
- THEN a `<div>` placeholder is rendered with a neutral muted background
- AND the placeholder displays "Sin imagen" text in Spanish
- AND no `<img>` with broken src is rendered

#### Scenario: No placeholder for successful image

- GIVEN `01.jpg` loaded successfully with HTTP 200
- WHEN the image tag is rendered
- THEN no placeholder is displayed
- AND the `<img>` element has a valid `src` attribute pointing to the resolved path

### Requirement 4: Path Caching

The system MUST cache successfully resolved image paths in a Set or Map so repeated grid renders (e.g., after filter changes) reuse cached results without network requests.

#### Scenario: Cache hit on re-render

- GIVEN `01.jpg` was resolved and cached
- WHEN the grid re-renders after a filter change
- THEN the path `img/tortas/01.jpg` is used directly
- AND no HTTP request is made for that path

#### Scenario: Cache miss triggers fresh probe

- GIVEN `05.jpg` is not in cache
- WHEN the system needs to load image 05
- THEN a fresh network request is made
- AND the result (success or failure) is cached

#### Scenario: Cache does not grow unbounded

- GIVEN many products with unique image folders
- WHEN all images are probed
- THEN cached paths are scoped per product folder
- AND the cache remains a bounded set of the total product images
