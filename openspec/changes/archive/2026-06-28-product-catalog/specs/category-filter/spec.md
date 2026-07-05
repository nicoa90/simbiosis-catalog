# category-filter Specification

## Purpose

Defines the JavaScript-driven filter bar that derives unique categories from product data, renders clickable filter buttons with active visual state, and toggles product visibility via `data-categoria` attribute matching.

## Requirements

### Requirement 1: Category Derivation

The system MUST derive unique categories from the `categoria` field across all validated products.

#### Scenario: Multiple categories derived

- GIVEN 6 products with 4 unique categories
- WHEN the system derives categories
- THEN exactly 4 unique category strings are returned
- AND "Todas" is prepended as the default "show all" option

#### Scenario: Single category

- GIVEN all products share the same category
- WHEN the system derives categories
- THEN exactly 1 unique category is returned plus "Todas"

#### Scenario: Empty product list

- GIVEN the validated product array is empty
- WHEN the system attempts to derive categories
- THEN no filter buttons are rendered
- AND only the "No hay productos disponibles" fallback is shown

### Requirement 2: Filter Button Rendering

The system MUST render a filter button bar with one button per unique category plus a "Todas" button as the first/default selection.

#### Scenario: Buttons match categories

- GIVEN 4 derived categories
- WHEN the filter bar renders
- THEN 5 buttons are displayed (Todas + 4 categories)
- AND each button shows its Spanish category name

#### Scenario: Category with accented characters

- GIVEN a category "Tartas" with an accented character
- WHEN the button renders
- THEN the button text reads "Tartas" preserving the accent

### Requirement 3: Show/Hide by data-categoria

Clicking a filter button MUST show products whose `data-categoria` matches the selected category and hide those that do not match. "Todas" MUST show all products.

#### Scenario: Filter shows matching products

- GIVEN the grid displays 6 products across 3 categories
- WHEN the user clicks "Tortas"
- THEN products with `data-categoria="Tortas"` are visible
- AND products with other categories have `display: none`
- AND no layout collapse occurs (hidden items preserve grid space via visibility or similar)

#### Scenario: Reset to all

- GIVEN a category filter is active
- WHEN the user clicks "Todas"
- THEN all products become visible
- AND no `display: none` remains on any card

#### Scenario: Filter with no matches

- GIVEN a category toggle matches no products
- WHEN the user clicks a category with zero products
- THEN the message "No hay productos en esta categoría" is displayed
- AND the grid area height does not collapse

### Requirement 4: Active State

The selected filter button MUST have a distinct visual state differentiating it from inactive buttons.

#### Scenario: Default active state

- GIVEN the filter bar has just rendered
- WHEN inspecting button classes
- THEN "Todas" has the `active` class
- AND all other buttons lack the `active` class

#### Scenario: Active state switches

- GIVEN "Todas" is the active filter
- WHEN the user clicks "Tartas"
- THEN "Todas" loses its `active` class
- AND "Tartas" gains the `active` class

#### Scenario: Very long category name

- GIVEN a category named "Budines y Panes Rústicos de Estación"
- WHEN its filter button renders
- THEN the button text does not overflow or break the layout
- AND the full category name remains readable (wraps if needed)
