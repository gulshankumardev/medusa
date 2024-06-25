import {
  EntityCascades,
  ExtractEntityRelations,
  IDmlEntity,
  IsDmlEntity,
  PropertyType,
  RelationshipType,
} from "@medusajs/types"
import { isObject, isString, toCamelCase } from "../common"
import { DMLSchema } from "./entity-builder"
import { BelongsTo } from "./relations/belongs-to"

type Config = string | { name?: string; tableName: string }

function extractNameAndTableName(nameOrConfig: Config) {
  const result = {
    name: "",
    tableName: "",
  }

  if (isString(nameOrConfig)) {
    const [schema, ...rest] = nameOrConfig.split(".")
    const name = rest.length ? rest.join(".") : schema
    result.name = toCamelCase(name)
    result.tableName = nameOrConfig
  }

  if (isObject(nameOrConfig)) {
    if (!nameOrConfig.tableName) {
      throw new Error(
        `Missing "tableName" property in the config object for "${nameOrConfig.name}" entity`
      )
    }

    const potentialName = nameOrConfig.name ?? nameOrConfig.tableName
    const [schema, ...rest] = potentialName.split(".")
    const name = rest.length ? rest.join(".") : schema

    result.name = toCamelCase(name)
    result.tableName = nameOrConfig.tableName
  }

  return result
}

/**
 * Dml entity is a representation of a DML model with a unique
 * name, its schema and relationships.
 */
export class DmlEntity<Schema extends DMLSchema> implements IDmlEntity<Schema> {
  [IsDmlEntity]: true = true

  name: string

  readonly #tableName: string
  #cascades: EntityCascades<string[]> = {}

  constructor(nameOrConfig: Config, public schema: Schema) {
    const { name, tableName } = extractNameAndTableName(nameOrConfig)
    this.name = name
    this.#tableName = tableName
  }

  /**
   * A static method to check if an entity is an instance of DmlEntity.
   * It allows us to identify a specific object as being an instance of
   * DmlEntity.
   *
   * @param entity
   */
  static isDmlEntity(entity: unknown): entity is DmlEntity<any> {
    return !!entity?.[IsDmlEntity]
  }

  /**
   * Parse entity to get its underlying information
   */
  parse(): {
    name: string
    tableName: string
    schema: PropertyType<any> | RelationshipType<any>
    cascades: EntityCascades<string[]>
  } {
    return {
      name: this.name,
      tableName: this.#tableName,
      schema: this.schema as unknown as
        | PropertyType<any>
        | RelationshipType<any>,
      cascades: this.#cascades,
    }
  }

  /**
   * Delete actions to be performed when the entity is deleted. For example:
   *
   * You can configure relationship data to be deleted when the current
   * entity is deleted.
   */
  cascades(
    options: EntityCascades<
      ExtractEntityRelations<Schema, "hasOne" | "hasMany">
    >
  ) {
    const childToParentCascades = options.delete?.filter((relationship) => {
      return BelongsTo.isBelongsTo(this.schema[relationship])
    })

    if (childToParentCascades?.length) {
      throw new Error(
        `Cannot cascade delete "${childToParentCascades.join(
          ", "
        )}" relationship(s) from "${
          this.name
        }" entity. Child to parent cascades are not allowed`
      )
    }

    this.#cascades = options
    return this
  }
}
