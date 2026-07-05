# Delta for image-loading

## MODIFIED Requirements

### Requirement 1: Named 3-Photo Loading

The system MUST load exactly 3 named images per product folder: `01.jpg` (main), `02.jpg` (secondary), `03.jpg` (tertiary). The system MUST NOT probe incrementing numbers or multiple extensions — only the three named files. For each, the system MUST use `new Image()` with onload/onerror to check existence. The return value MUST be a structured object `{ main: string, secondary: string, tertiary: string }` with resolved paths or empty string per slot.
(Previously: sequential numeric probing starting from 01.{ext}, incrementing until all extensions for a number returned 404)

#### Scenario: All three photos exist

- GIVEN the folder `img/tortas/` contains `01.jpg`, `02.jpg`, and `03.jpg`
- WHEN `loadImages('img/tortas/')` is called
- THEN exactly 3 `Image()` objects are created (one per named file)
- AND the function returns `{ main: 'img/tortas/01.jpg', secondary: 'img/tortas/02.jpg', tertiary: 'img/tortas/03.jpg' }`
- AND no probing beyond the 3 named files occurs

#### Scenario: Missing tertiary photo

- GIVEN the folder `img/tortas/` contains only `01.jpg` and `02.jpg`
- WHEN `loadImages('img/tortas/')` is called
- THEN the function returns `{ main: 'img/tortas/01.jpg', secondary: 'img/tortas/02.jpg', tertiary: '' }`
- AND the tertiary slot renders a CSS placeholder
- AND no HTTP request is made for `04.jpg`

#### Scenario: All three photos missing

- GIVEN the folder `img/tortas/` contains no image files
- WHEN `loadImages('img/tortas/')` is called
- THEN the function returns `{ main: '', secondary: '', tertiary: '' }`
- AND all three slots render CSS placeholders with "Sin imagen"

### Requirement 3: Placeholder Fallback

When an image slot resolves to an empty string (no image found), the system MUST render a CSS placeholder element, not a broken image icon.
(Previously: placeholder rendered after exhausting all extensions for a probed number)

#### Scenario: Placeholder renders for missing slot

- GIVEN `img/tortas/03.jpg` does not exist
- WHEN the tertiary slot resolves to empty string
- THEN a `<div>` placeholder is rendered with a neutral muted background
- AND the placeholder displays "Sin imagen" text in Spanish
- AND no `<img>` with broken src is rendered

#### Scenario: No placeholder for successful image

- GIVEN `img/tortas/01.jpg` loads successfully
- WHEN the main image tag is rendered
- THEN no placeholder is displayed
- AND the `<img>` element has `src="img/tortas/01.jpg"`

### Requirement 4: Path Caching

The system MUST cache successfully resolved image paths per product folder so repeated renders reuse cached results without network requests.
(Previously: cached per product folder, same mechanism but for variable-size probe results)

#### Scenario: Cache hit on re-render

- GIVEN a product folder's images were previously resolved and cached as `{ main: '...', secondary: '...', tertiary: '...' }`
- WHEN the grid re-renders after a filter change
- THEN the cached paths are used directly
- AND no new HTTP requests are made for that folder

#### Scenario: Cache miss triggers fresh load

- GIVEN a product folder has no cached entry
- WHEN the system needs to load images for that folder
- THEN fresh `Image()` checks are performed for 01.jpg, 02.jpg, 03.jpg
- AND the result is cached for future renders

## REMOVED Requirements

### Requirement 2: Extension Probe Order

(Reason: named 3-photo system loads only `.jpg` — no extension probing needed)
(Migration: extension-probing logic and `.jpeg`/`.png`/`.webp` fallback loop removed from image-loading module)

### Requirement 1 (original): Sequential Numeric Probing

(Reason: replaced by named 3-photo loading — no sequential incrementing beyond 3 files)
(Migration: probing loop replaced by direct named-file construction; image-loading function signature changes from array return to structured object)
