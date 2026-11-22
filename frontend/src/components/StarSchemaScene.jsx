import SchemaScene from './SchemaScene.jsx'
import {
  STAR_SCHEMA_RELATIONSHIPS,
  STAR_SCHEMA_TABLES,
} from '../data/starSchema.js'

const relationships = STAR_SCHEMA_RELATIONSHIPS.map((relationship) => ({
  ...relationship,
  fromTable: relationship.dimensionTable,
  toTable: relationship.factTable,
}))

function StarSchemaScene({ onSelect, selectedTableId }) {
  return (
    <SchemaScene
      onSelect={onSelect}
      relationships={relationships}
      selectedTableId={selectedTableId}
      tables={STAR_SCHEMA_TABLES}
    />
  )
}

export default StarSchemaScene
