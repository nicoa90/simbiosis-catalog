# embed-iframe Specification

## Purpose

Defines the ResizeObserver + postMessage mechanism that enables Tiendup to embed the catalog in an auto-sizing iframe, matching full content height without internal scroll.

## Requirements

### Requirement 1: Height Observation

The system MUST observe the document body height changes via ResizeObserver on page load.

#### Scenario: Observer attached on load

- GIVEN the catalog page loads inside an iframe
- WHEN the DOMContentLoaded event fires
- THEN a ResizeObserver is attached to `document.body`
- AND the initial height is captured

#### Scenario: Height change after filter

- GIVEN the catalog is loaded inside an iframe
- WHEN the user clicks a category filter that changes visible content height
- THEN the ResizeObserver callback fires with the new `contentRect.height`

#### Scenario: ResizeObserver not supported

- GIVEN the browser does not support ResizeObserver
- WHEN the page loads
- THEN the system MUST fall back to measuring `document.body.scrollHeight` on load
- AND re-measure on filter changes using a `MutationObserver`

### Requirement 2: postMessage Emission

The system MUST call `window.parent.postMessage()` with an `{ iframeHeight: number }` payload on height change.

#### Scenario: Correct message payload

- GIVEN the content height is 2400px
- WHEN the ResizeObserver fires
- THEN `window.parent.postMessage({ iframeHeight: 2400 }, '*')` is called
- AND the message origin is `'*'` to support cross-domain parent

#### Scenario: No unnecessary messages on stable height

- GIVEN the content height is stable at 1800px
- WHEN no DOM changes occur
- THEN no postMessage is emitted

#### Scenario: Parent window not available

- GIVEN the page is not loaded inside an iframe (no parent)
- WHEN the system attempts postMessage
- THEN no error is thrown
- AND the message is silently discarded by the browser

### Requirement 3: Debounce

The system MUST debounce postMessage emission with a 300ms delay to batch rapid resize events.

#### Scenario: Rapid resizes batched

- GIVEN the content height changes 5 times within 200ms
- WHEN the ResizeObserver fires each change
- THEN only 1 postMessage is emitted
- AND it fires 300ms after the last resize

#### Scenario: Single resize

- GIVEN the content height changes once
- WHEN no further changes occur within 300ms
- THEN exactly 1 postMessage is emitted with the final height

### Requirement 4: No Internal Scroll

The document MUST render without internal scroll — content height must match the full document height exactly.

#### Scenario: Overflow hidden

- GIVEN the catalog page loads
- WHEN inspecting computed styles
- THEN `overflow: hidden` is set on `<html>` or `<body>`
- AND `document.documentElement.scrollHeight` equals the visible content height

#### Scenario: Large product list

- GIVEN a product list requiring 4000px of content
- WHEN the page renders
- THEN no scrollbar appears inside the iframe
- AND postMessage reports 4000px as the iframeHeight

#### Scenario: Images loading asynchronously change height

- GIVEN the initial content height is 1500px
- WHEN images finish loading and increase the content height to 2200px
- THEN the ResizeObserver fires after the last image loads
- AND the iframeHeight updates to 2200px
- AND no internal scroll appears at any point
