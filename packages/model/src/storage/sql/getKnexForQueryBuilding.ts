import { NodeDefinition, NodeSchema } from "../../Schema";
import knex from "knex";

export default function getKnex(schema: NodeSchema) {
  switch (schema.storage.persisted?.engine) {
    case "sqlite":
      return knex({ client: "sqlite" });
    default:
      throw new Error("unsupported");
  }
}
