# product-data Specification

## Purpose

Defines the YAML product schema and the runtime fetch, parse, validation, and exposure behavior that supplies product data to the catalog grid and filter components.

## Requirements

### Requirement 1: YAML Fetch

The system MUST fetch `productos.yaml` from the document root on page load.

#### Scenario: Successful fetch returns valid YAML

- GIVEN the catalog page loads
- WHEN the system requests `productos.yaml`
- THEN the response has HTTP 200
- AND the raw YAML text is passed to the parser

#### Scenario: Fetch returns 404

- GIVEN the catalog page loads
- WHEN `productos.yaml` returns HTTP 404
- THEN the system MUST display "Error al cargar el catálogo" in Spanish
- AND the system MUST NOT attempt to render the grid

#### Scenario: Network error

- GIVEN the catalog page loads
- WHEN the fetch fails due to network issues
- THEN the system MUST display "Error de conexión. Intente nuevamente."
- AND no partial grid is rendered

### Requirement 2: YAML Parsing

The system MUST parse fetched YAML using js-yaml v4.x loaded from CDN.

#### Scenario: Parsing succeeds

- GIVEN valid YAML has been fetched
- WHEN the system calls `jsyaml.load(rawText)`
- THEN a JavaScript object is returned
- AND the system proceeds to schema validation

#### Scenario: Malformed YAML

- GIVEN a malformed `productos.yaml` has been fetched
- WHEN `jsyaml.load()` throws a YAMLException
- THEN the system displays "Error al leer los datos del catálogo"
- AND the error is logged to the console

### Requirement 3: Schema Validation

The system MUST validate that parsed data contains a `productos` array and each item has `nombre`, `categoria`, and `carpeta_imagenes` as non-empty strings. The `recomendacion` field is OPTIONAL and MAY be present as a string.

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
