function field(name, type, options = {}) {
  return {
    name,
    type,
    key: null,
    nullable: true,
    identity: false,
    references: null,
    constraint: null,
    ...options,
  }
}

export const STAR_SCHEMA_TABLES = [
  {
    id: 'fact_vehicle_marketplace',
    name: 'star.fact_vehicle_marketplace',
    kind: 'FACT',
    role: 'One accepted source vehicle record per fact row; it does not assert a completed sale.',
    position: [0, 0.55, 0],
    primaryKey: 'vehicle_marketplace_key',
    uniqueConstraints: ['UNIQUE (source_file_name, source_record_ordinal)'],
    columns: [
      field('vehicle_marketplace_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('source_dataset_key', 'BIGINT', {
        key: 'FK',
        nullable: false,
        references: 'star.dim_source_dataset.source_dataset_key',
      }),
      field('brand_key', 'BIGINT', {
        key: 'FK',
        references: 'star.dim_brand.brand_key',
      }),
      field('model_key', 'BIGINT', {
        key: 'FK',
        references: 'star.dim_model.model_key',
      }),
      field('location_key', 'BIGINT', {
        key: 'FK',
        references: 'star.dim_location.location_key',
      }),
      field('vehicle_year_key', 'BIGINT', {
        key: 'FK',
        references: 'star.dim_vehicle_year.vehicle_year_key',
      }),
      field('fuel_key', 'BIGINT', {
        key: 'FK',
        references: 'star.dim_fuel.fuel_key',
      }),
      field('transmission_key', 'BIGINT', {
        key: 'FK',
        references: 'star.dim_transmission.transmission_key',
      }),
      field('seller_type_key', 'BIGINT', {
        key: 'FK',
        references: 'star.dim_seller_type.seller_type_key',
      }),
      field('source_file_name', 'TEXT', { nullable: false }),
      field('source_record_ordinal', 'BIGINT', {
        nullable: false,
        constraint: 'CHECK (> 0)',
      }),
      field('source_row_identifier_field', 'TEXT'),
      field('source_row_identifier_raw', 'TEXT'),
      field('combined_cars_selling_price_raw', 'NUMERIC'),
      field('combined_cars_present_price_raw', 'NUMERIC'),
      field('combined_cars2_price_raw', 'NUMERIC'),
      field('combined_cars3_selling_price_raw', 'NUMERIC'),
      field('odometer_km', 'NUMERIC'),
      field('combined_cars2_car_age_raw', 'NUMERIC'),
      field('combined_cars3_vehicle_age_raw', 'NUMERIC'),
      field('combined_cars_owner_raw', 'NUMERIC'),
      field('combined_cars3_mileage_raw', 'NUMERIC'),
      field('combined_cars3_engine_raw', 'NUMERIC'),
      field('combined_cars3_max_power_raw', 'NUMERIC'),
      field('combined_cars3_seats_raw', 'NUMERIC'),
    ],
  },
  {
    id: 'dim_source_dataset',
    name: 'star.dim_source_dataset',
    kind: 'DIMENSION',
    role: 'Identifies the supplied CSV and its observed Source.Name group.',
    position: [0, 0.25, -7.4],
    primaryKey: 'source_dataset_key',
    uniqueConstraints: ['UNIQUE (container_csv_name, source_name_value)'],
    columns: [
      field('source_dataset_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('container_csv_name', 'TEXT', { nullable: false }),
      field('source_name_value', 'TEXT'),
    ],
  },
  {
    id: 'dim_brand',
    name: 'star.dim_brand',
    kind: 'DIMENSION',
    role: 'Stores the source-scoped raw brand name.',
    position: [5.23, 0.25, -5.23],
    primaryKey: 'brand_key',
    uniqueConstraints: ['UNIQUE (source_dataset_name, brand_name_raw)'],
    columns: [
      field('brand_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('source_dataset_name', 'TEXT', { nullable: false }),
      field('brand_name_raw', 'TEXT', { nullable: false }),
    ],
  },
  {
    id: 'dim_model',
    name: 'star.dim_model',
    kind: 'DIMENSION',
    role: 'Stores the source-specific model field and raw model names.',
    position: [7.4, 0.25, 0],
    primaryKey: 'model_key',
    uniqueConstraints: [],
    columns: [
      field('model_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('source_dataset_name', 'TEXT', { nullable: false }),
      field('source_model_field', 'TEXT', { nullable: false }),
      field('model_name_raw', 'TEXT', { nullable: false }),
      field('full_model_name_raw', 'TEXT'),
    ],
  },
  {
    id: 'dim_location',
    name: 'star.dim_location',
    kind: 'DIMENSION',
    role: 'Stores an observed city label only; no state or region hierarchy is defined.',
    position: [5.23, 0.25, 5.23],
    primaryKey: 'location_key',
    uniqueConstraints: ['UNIQUE (source_dataset_name, city_name_raw)'],
    columns: [
      field('location_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('source_dataset_name', 'TEXT', { nullable: false }),
      field('city_name_raw', 'TEXT', { nullable: false }),
    ],
  },
  {
    id: 'dim_vehicle_year',
    name: 'star.dim_vehicle_year',
    kind: 'DIMENSION',
    role: 'Stores supported vehicle model years, not transaction dates.',
    position: [0, 0.25, 7.4],
    primaryKey: 'vehicle_year_key',
    uniqueConstraints: ['UNIQUE (vehicle_year)'],
    columns: [
      field('vehicle_year_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('vehicle_year', 'SMALLINT', {
        nullable: false,
        constraint: 'UNIQUE',
      }),
    ],
  },
  {
    id: 'dim_fuel',
    name: 'star.dim_fuel',
    kind: 'DIMENSION',
    role: 'Stores source-scoped raw fuel type labels.',
    position: [-5.23, 0.25, 5.23],
    primaryKey: 'fuel_key',
    uniqueConstraints: ['UNIQUE (source_dataset_name, fuel_type_raw)'],
    columns: [
      field('fuel_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('source_dataset_name', 'TEXT', { nullable: false }),
      field('fuel_type_raw', 'TEXT', { nullable: false }),
    ],
  },
  {
    id: 'dim_transmission',
    name: 'star.dim_transmission',
    kind: 'DIMENSION',
    role: 'Stores source-scoped raw transmission labels.',
    position: [-7.4, 0.25, 0],
    primaryKey: 'transmission_key',
    uniqueConstraints: ['UNIQUE (source_dataset_name, transmission_type_raw)'],
    columns: [
      field('transmission_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('source_dataset_name', 'TEXT', { nullable: false }),
      field('transmission_type_raw', 'TEXT', { nullable: false }),
    ],
  },
  {
    id: 'dim_seller_type',
    name: 'star.dim_seller_type',
    kind: 'DIMENSION',
    role: 'Stores source-scoped raw seller type labels.',
    position: [-5.23, 0.25, -5.23],
    primaryKey: 'seller_type_key',
    uniqueConstraints: ['UNIQUE (source_dataset_name, seller_type_raw)'],
    columns: [
      field('seller_type_key', 'BIGINT', {
        key: 'PK',
        nullable: false,
        identity: true,
      }),
      field('source_dataset_name', 'TEXT', { nullable: false }),
      field('seller_type_raw', 'TEXT', { nullable: false }),
    ],
  },
]

const factTable = STAR_SCHEMA_TABLES.find((table) => table.kind === 'FACT')

export const STAR_SCHEMA_RELATIONSHIPS = factTable.columns
  .filter((column) => column.references)
  .map((column) => {
    const [, dimensionTable, dimensionColumn] = column.references.split('.')
    return {
      id: `${column.name}-${dimensionTable}`,
      factTable: factTable.id,
      factColumn: column.name,
      dimensionTable,
      dimensionColumn,
      nullable: column.nullable,
    }
  })
