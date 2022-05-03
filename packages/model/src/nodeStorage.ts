import { Changeset } from "Changeset";
import { Context } from "context";
import { ID_of } from "ID";
import { NodeDefinition, NodeInstanceType, NodeSchema } from "Schema";

export default {
  async readOne<N extends NodeSchema>(
    context: Context,
    definition: NodeDefinition<N>,
    id: ID_of<NodeInstanceType<N>>
  ): Promise<NodeInstanceType<N>> {
    throw new Error("read from storage not yet available");
  },

  async writeBatch(
    context: Context,
    changes: Changeset<NodeSchema>[]
  ): Promise<void> {
    throw new Error("Writes to storage not yet available");
  },
};
