import { NodeDefinition, NodeSchema } from "../../Schema";
import knex from "knex";

export default function getKnex(spec: NodeDefinition<NodeSchema>) {
  switch (spec.schema.storage.persisted?.engine) {
    case "sqlite":
      return knex({ client: "sqlite" });
    default:
      throw new Error("unsupported");
  }
}
