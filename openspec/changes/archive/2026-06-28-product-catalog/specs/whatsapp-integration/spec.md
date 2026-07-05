# whatsapp-integration Specification

## Purpose

Defines WhatsApp per-product consultation links via `wa.me` URLs with pre-filled product names and a persistent floating button for direct business contact.

## Requirements

### Requirement 1: Per-Product WhatsApp Link

Each product card MUST include a visible "Consultar" `<a>` element that opens `https://wa.me/5491134285333` with the product name pre-filled in the message text.

#### Scenario: Correct wa.me URL for product

- GIVEN a product with `nombre: "Torta de Chocolate"`
- WHEN the Consultar link is clicked
- THEN the URL `https://wa.me/5491134285333?text=Hola%2C%20quiero%20consultar%20por%3A%20Torta%20de%20Chocolate` is opened
- AND `target="_blank"` is set on the link

#### Scenario: Product name with special characters

- GIVEN a product with `nombre: "Tarta de Frutos Rojos - SIN TACC"`
- WHEN the Consultar link is rendered
- THEN the `href` attribute contains URI-encoded `-`, spaces, and special chars
- AND the decoded message reads "Hola, quiero consultar por: Tarta de Frutos Rojos - SIN TACC"

### Requirement 2: Floating WhatsApp Button

The system MUST render a floating WhatsApp button fixed to the bottom-right corner, visible on all viewports without JavaScript (pure `<a>` element).

#### Scenario: Button present on all viewports

- GIVEN the page loads on a 375px-wide viewport
- WHEN inspecting the DOM
- THEN a WhatsApp icon `<a>` is found with `position: fixed`
- AND the button is also present at 1440px viewport width
- AND `bottom: 20px; right: 20px` are the applied offsets

#### Scenario: Button stacking context

- GIVEN the floating button renders
- WHEN any other element overlaps the bottom-right area
- THEN the button has `z-index: 1000` or higher
- AND remains clickable above all other content

### Requirement 3: Non-Interference

The floating button MUST NOT obscure interactive content or require special layout adjustments beyond bottom padding.

#### Scenario: Bottom content on large viewport

- GIVEN the page footer renders on a 1440px-wide viewport
- WHEN the floating button is present
- THEN no content is hidden behind the button
- AND the page has at least 80px bottom padding to clear the button

#### Scenario: Bottom content on mobile viewport

- GIVEN the page footer renders on a 375px-wide viewport
- WHEN the floating button is present at the bottom-right
- THEN the button does not overlap the last footer link or text
- AND the bottom padding is sufficient (80px minimum)

#### Scenario: Button near interactive CTA

- GIVEN a clickable "Ver más" link is near the bottom-right of the page
- WHEN the floating button overlaps that area
- THEN the WhatsApp button has higher z-index
- AND the CTA remains accessible via its own tap area that is not occluded
