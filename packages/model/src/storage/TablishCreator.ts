import { nullthrows } from "@strut/utils";
import { Context } from "../context";
import {
  NodeSchema,
  SchemaFieldType,
  stringField,
  intField,
  bigintField,
  floatField,
  booleanField,
  idField,
  objectField,
  arrayField,
  mapField,
} from "../Schema";
import storageType from "./storageType";

export function create(context: Context, schema: NodeSchema): Promise<void> {
  const persisted = nullthrows(schema.storage.persisted);
  const db = context.dbResolver
    .type(storageType(persisted.engine))
    .engine(persisted.engine)
    .db(persisted.db);

  // TODO: field definitions actually need some meat on them.
  // Primary, unique, indexed, etc, etc.
  return db.schema.createTable(persisted.tablish, (table) => {
    // TODO: switch to SID which are 64bit unsigned ints that are
    // monatonically increasing
    // TODO: maybe use a visitor pattern here. Each engine will have
    // a different way of defining this.
    table.string("_id", 16).primary();
    Object.entries(schema.fields()).forEach(([key, value]) => {
      if (value === stringField) {
        table.string(key);
      } else if (value === intField) {
        table.integer(key);
      } else if (value === booleanField) {
        table.boolean(key);
      } else if (value === idField || value === bigintField) {
        table.bigInteger(key);
      } else if (
        value === objectField ||
        value === arrayField ||
        value === mapField
      ) {
        table.text(key);
      } else if (value === floatField) {
        table.float(key);
      }
    });
  });
}
