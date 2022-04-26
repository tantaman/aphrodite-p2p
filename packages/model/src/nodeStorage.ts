import { Changeset } from "Changeset";
import { Context } from "context";
import { ID_of } from "ID";
import {
  NodeDefinition,
  NodeEdgesSchema,
  NodeInstanceType,
  NodeSchema,
} from "Schema";

export default {
  async readOne<N extends NodeSchema, E extends NodeEdgesSchema>(
    context: Context,
    definition: NodeDefinition<N, E>,
    id: ID_of<NodeInstanceType<N, E>>
  ): Promise<NodeInstanceType<N, E>> {
    throw new Error("read from storage not yet available");
  },

  async writeBatch(
    context: Context,
    changes: Changeset<NodeSchema, NodeEdgesSchema>[]
  ): Promise<void> {
    throw new Error("Writes to storage not yet available");
  },
};
