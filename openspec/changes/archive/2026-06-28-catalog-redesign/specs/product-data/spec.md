# Delta for product-data

## MODIFIED Requirements

### Requirement 3: Schema Validation

The system MUST validate that parsed data contains a `productos` array and each item has `nombre`, `categoria`, and `carpeta_imagenes` as non-empty strings. The `recomendacion` field is OPTIONAL and MAY be present as a string.
(Previously: validated only nombre, categoria, carpeta_imagenes as required non-empty strings)

#### Scenario: All products valid

- GIVEN a parsed object with a `productos` array of 5 items
- WHEN each item has all required fields
- THEN all 5 items are accepted

#### Scenario: Product missing required field

- GIVEN a parsed object with a `productos` array
- WHEN one item is missing `nombre`
- THEN that item is skipped
- AND a warning is logged to the console

#### Scenario: Empty productos array

- GIVEN the `productos` array is empty after validation
- WHEN the system exposes the data
- THEN the system displays "No hay productos disponibles"
- AND no grid is rendered

#### Scenario: Product includes recomendacion

- GIVEN a parsed object where one product has `recomendacion: "Ideal para eventos grandes"`
- WHEN the system validates this product
- THEN the product is accepted
- AND the `recomendacion` field is preserved in the validated data

#### Scenario: Product without recomendacion

- GIVEN a parsed object where no product has the `recomendacion` field
- WHEN the system validates each product
- THEN all products are accepted
- AND no validation warning is logged for the missing field

### Requirement 4: Data Exposure

The system MUST expose the validated product array as an in-memory array accessible to the grid renderer and filter initializer.
(Previously: same behavior, no recomendacion field)

#### Scenario: Array available after init

- GIVEN product data has been parsed and validated
- WHEN the grid renderer reads the exposed array
- THEN a non-empty array of product objects is returned
- AND each object preserves all YAML fields including `presentaciones`, `conservacion`, and `recomendacion` if present

#### Scenario: Exposure before validation completes

- GIVEN the fetch has resolved but validation is in progress
- WHEN a component requests the product array
- THEN the system MUST return `null` or an empty array
- AND the component MUST handle the pending state gracefully
