import { nullthrows } from "@strut/utils";
import { Changeset } from "Changeset";
import { Context } from "context";
import { ID_of } from "ID";
import { NodeDefinition, NodeInstanceType, NodeSchema } from "Schema";
import storageType from "storage/storageType";

export default {
  // Does readOne make sense? Or should this responsibility exist fully
  // in SourceExpression?
  async readOne<N extends NodeSchema>(
    context: Context,
    definition: NodeDefinition<N>,
    id: ID_of<NodeInstanceType<N>>
  ): Promise<NodeInstanceType<N>> {
    const persist = nullthrows(definition.schema.storage.persisted);
    const db = context.dbResolver
      .type(storageType(persist.engine))
      .engine(persist.engine)
      .db(persist.db);

    // Convert to the appropriate select statement.
    // This is based in `queryAll` of query layer?

    throw new Error();
  },

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
    // Maybe uplevel the DB API to take changesets and such things?
    // Or create another layer like `SQLMutator`...
    // switch on engine to create the query...
  },
};
