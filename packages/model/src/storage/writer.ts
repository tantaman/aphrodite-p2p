import { nullthrows } from "@strut/utils";
import { Changeset } from "../mutator/Changeset";
import { Context } from "../context";
import { NodeSchema } from "../Schema";
import storageType from "../storage/storageType";

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

    // TODO: We'll figure a better abstraction (pluggable abstraction) for this
    // in future iterations
    switch (persist.engine) {
      case "sqlite":
        // convert to SQL ala `specAndOpsToSQL`
        // await db.exec("YO! convert to SQL ala `specAndOpsToSQL`", []);
        break;
    }
  },
};
