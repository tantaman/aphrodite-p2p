import { nullthrows } from "@strut/utils";
import { Changeset } from "mutator/Changeset";
import { Context } from "context";
import { NodeSchema } from "Schema";
import storageType from "storage/storageType";

export default {
  // Expectation is that all changesets are correctly batched.
  // I.e., they all go to the same table.
  // Or can we not send them to many tables so long as they are all on the same db?
  async writeBatch(
    context: Context,
    changes: Changeset<NodeSchema>[]
  ): Promise<void> {
    const firstChange = changes[0];
    if (firstChange == null) {
      return;
    }

    let schema: NodeSchema;
    if (firstChange.type === "create") {
      schema = firstChange.definition.schema;
    } else {
      schema = firstChange.node._definition.schema;
    }

    const persist = nullthrows(schema.storage.persisted);
    const db = context.dbResolver
      .type(storageType(persist.engine))
      .engine(persist.engine)
      .db(persist.db);

    // Ok... now we need to build the appropriate query.
    // How do?
    // Either pass changesets to DB or find a "write converter"
    // to convert to a raw query.
    // we can do write conversions inline to start.
  },
};
