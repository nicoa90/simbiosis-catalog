# catalog-grid Specification

## Purpose

Defines the responsive CSS Grid rendering of product cards with an earthy, natural, clean visual identity matching simbiosiscocina.com, adapting layout across mobile, tablet, and desktop viewports.

## Requirements

### Requirement 1: Responsive Grid Layout

The grid MUST render in CSS Grid with three breakpoints: 1 column below 640px, 2 columns from 640px to 1023px, and 3 columns at 1024px and above. The CSS MUST be mobile-first.

#### Scenario: Mobile viewport (under 640px)

- GIVEN the viewport width is 375px
- WHEN the grid renders
- THEN `grid-template-columns` resolves to `1fr`
- AND each product card spans the full width

#### Scenario: Tablet viewport (640px to 1023px)

- GIVEN the viewport width is 768px
- WHEN the grid renders
- THEN `grid-template-columns` resolves to `repeat(2, 1fr)`
- AND cards arrange in two equal columns

#### Scenario: Desktop viewport (1024px and above)

- GIVEN the viewport width is 1440px
- WHEN the grid renders
- THEN `grid-template-columns` resolves to `repeat(3, 1fr)`
- AND cards arrange in three equal columns

#### Scenario: Viewport at exact breakpoint boundary

- GIVEN the viewport width is exactly 640px
- WHEN the grid renders
- THEN the 2-column layout applies (min-width: 640px inclusive)
- AND no layout or overflow issues occur at the boundary

### Requirement 2: Product Card Content

Each card MUST display: `nombre` as heading, `categoria` as badge, `descripcion` as body text, `presentaciones` as a structured price list, and at least the first loaded product image.

#### Scenario: Card with all fields

- GIVEN a product with all YAML fields populated
- WHEN the card renders
- THEN the `nombre` appears as an `<h3>`
- AND `categoria` appears as a badge element
- AND `descripcion` renders as paragraph text
- AND each `presentación` shows tamaño, medida, rinde, and precio
- AND the first loaded image is displayed

#### Scenario: Product missing optional fields

- GIVEN a product with no `descripcion` and no `presentaciones`
- WHEN the card renders
- THEN those sections are omitted
- AND no empty containers or placeholder text appear

### Requirement 3: Visual Identity

The grid MUST use warm neutrals, muted green accents, rounded corners (8px+), and consistent spacing for an earthy, natural aesthetic.

#### Scenario: Default card appearance

- GIVEN a product card renders
- THEN the card has a warm off-white `#faf8f5` background
- AND category badges have a muted green `#6b8f71` background
- AND card corners are rounded (8px minimum)
- AND card spacing is consistent (gap 16px minimum)
- AND prices display in bold type

#### Scenario: Card on very narrow viewport

- GIVEN the viewport width is 320px
- WHEN the card renders
- THEN the image scales down proportionally without overflow
- AND all text remains readable without horizontal scroll
- AND bottom padding is maintained

### Requirement 4: Presentaciones Display

Each product's pricing variants MUST render as a list with each variant showing its size (tamaño), measure (medida), yield (rinde), and price (precio).

#### Scenario: Multiple variants

- GIVEN a product with 3 presentaciones
- WHEN the card renders the list
- THEN each variant is a separate row
- AND all four sub-fields are visible per row

#### Scenario: Single variant

- GIVEN a product with 1 presentación
- WHEN the card renders
- THEN the single row occupies less vertical space
- AND the layout is not visually broken
