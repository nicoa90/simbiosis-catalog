# whatsapp-integration Specification

## Purpose

Defines WhatsApp per-product consultation links via `wa.me` URLs with pre-filled product names placed within each product's info column.

## Requirements

### Requirement 1: Per-Product WhatsApp Link

Each product section MUST include a visible "Consultar" `<a>` element within the info column that opens `https://wa.me/5491134285333` with the product name pre-filled in the message text. The link MUST be positioned in the info column alongside the presentaciones and description.

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

#### Scenario: Link renders within info column

- GIVEN a product section renders with both photo and info columns
- WHEN inspecting the DOM
- THEN the Consultar link exists inside the info column `<div>`
- AND the link appears after the presentaciones list and before the conservacion text


