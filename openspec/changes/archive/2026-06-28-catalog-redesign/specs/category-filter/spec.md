# Delta for category-filter

## MODIFIED Requirements

### Requirement 4: Active State

The selected filter button MUST have a distinct visual state using an underline or line-based indicator below the text. The active state MUST NOT use a filled pill or solid background shape.
(Previously: distinct visual state differentiating active from inactive without specifying style — used pill shape)

#### Scenario: Default active state

- GIVEN the filter bar has just rendered
- WHEN inspecting button styles
- THEN "Todas" has the `active` class
- AND the active button has no filled background
- AND a bottom border or underline indicator is visible below the active button text

#### Scenario: Active state switches

- GIVEN "Todas" is the active filter
- WHEN the user clicks "Tartas"
- THEN "Todas" loses its `active` class
- AND "Tartas" gains the `active` class
- AND the underline/line indicator moves to "Tartas"

#### Scenario: Very long category name

- GIVEN a category named "Budines y Panes Rústicos de Estación"
- WHEN its filter button renders
- THEN the button text does not overflow or break the layout
- AND the underline indicator spans the full button width
