# catalog-grid Specification

## Purpose

Defines the editorial two-column magazine layout rendering of product sections with alternating column order, typographic heading hierarchy, 3-photo display, and a warm earthy visual identity.

## Requirements

### Requirement 1: Editorial Two-Column Layout

The system MUST render products as full-width `<section>` elements. Each section MUST have two inner `<div>` columns for photos and info. Column order MUST alternate between products via CSS classes `layout-photos-first` and `layout-info-first`. On viewports below 768px, the layout MUST collapse to a single stacked column.

#### Scenario: Alternating column order

- GIVEN 2 products in the catalog
- WHEN the grid renders
- THEN product 1 has class `layout-photos-first` (photos left, info right)
- AND product 2 has class `layout-info-first` (info left, photos right)
- AND each section uses a horizontal `<hr>` divider after it

#### Scenario: Desktop viewport (≥768px)

- GIVEN the viewport width is 1024px
- WHEN the section renders
- THEN two equal-width columns are displayed side by side
- AND the main image column is larger (approx 60%) and the info column is narrower (approx 40%)

#### Scenario: Mobile viewport (<768px)

- GIVEN the viewport width is 375px
- WHEN the section renders
- THEN columns stack vertically — photos above info
- AND no horizontal overflow occurs

### Requirement 2: Product Section Content

Each product section MUST display: up to 3 photos (main large + 2 smaller in a row below), `nombre` as editorial heading (h2), `categoria` as subtitle, `descripcion` as body text, `recomendacion` if present, `presentaciones` as a structured price list, and `conservacion` as small text.

#### Scenario: Section with all fields and 3 photos

- GIVEN a product with all YAML fields populated and 3 photos (01.jpg, 02.jpg, 03.jpg)
- WHEN the section renders
- THEN `nombre` appears as an editorial `<h2>` heading
- AND `categoria` appears as a subtitle
- AND `descripcion` renders as paragraph text
- AND `recomendacion` renders after `conservacion`
- AND the main photo (01.jpg) displays large in the photo column
- AND photos 02.jpg and 03.jpg display as a horizontal row below the main photo
- AND presentaciones show tamaño, medida, rinde, and precio

#### Scenario: Product missing optional fields

- GIVEN a product with no `descripcion`, no `presentaciones`, and no `recomendacion`
- WHEN the section renders
- THEN those sections are omitted
- AND no empty containers or placeholder text appear
- AND the heading and photos still render normally

#### Scenario: Product with only 1 photo

- GIVEN a product where only 01.jpg exists (02.jpg and 03.jpg are placeholder)
- WHEN the section renders
- THEN the main photo displays at full photo-column width
- AND the secondary row area shows two placeholder `<div>` elements with neutral background

### Requirement 3: Editorial Visual Identity

The system MUST use Playfair Display (Google Fonts) for headings (h1-h3), system sans-serif for body text, earthy deep palette, generous spacing (2-4x previous), and horizontal `<hr>` section dividers.

#### Scenario: Default section appearance

- GIVEN a product section renders
- THEN headings use `font-family: 'Playfair Display', Georgia, Times, serif`
- AND `font-display: swap` is configured for the web font
- AND body text uses system sans-serif
- AND each section has generous top/bottom padding (min 48px)
- AND a subtle alternating background tint differentiates sections
- AND horizontal `<hr>` dividers separate product sections

#### Scenario: Google Fonts CDN unavailable

- GIVEN the Playfair Display CDN fails to load
- WHEN the section renders
- THEN the browser falls back to Georgia/Times serif stack
- AND the layout and spacing are identical

#### Scenario: Section on very narrow viewport

- GIVEN the viewport width is 320px
- WHEN the section renders
- THEN photos stack vertically without overflow
- AND all text remains readable without horizontal scroll
- AND bottom padding is maintained

### Requirement 4: Presentaciones Display

Each product's pricing variants MUST render as a list with each variant showing its size (tamaño), measure (medida), yield (rinde), and price (precio).

#### Scenario: Multiple variants

- GIVEN a product with 3 presentaciones
- WHEN the section renders the list
- THEN each variant is a separate row
- AND all four sub-fields are visible per row

#### Scenario: Single variant

- GIVEN a product with 1 presentación
- WHEN the section renders
- THEN the single row occupies less vertical space
- AND the layout is not visually broken
