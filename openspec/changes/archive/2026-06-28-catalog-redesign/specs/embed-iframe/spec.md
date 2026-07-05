# Delta for embed-iframe

## Review

No spec changes required. The debounce timing (300ms), ResizeObserver mechanism, postMessage payload format, and no-internal-scroll behavior are all unchanged in scope. The catalog-redesign changes the DOM structure (more sections, taller content) but the iframe auto-height mechanism already handles variable content heights through existing ResizeObserver/postMessage flow.

## Verification

The existing embed-iframe scenarios cover the redesign's taller content:
- "Height change after filter" — equally applies to height change from alternating sections
- "Large product list" — the editorial layout will produce taller sections; postMessage must report the new height
- "Images loading asynchronously change height" — 3 images per product may increase height transitions; debounce (300ms) still applies
