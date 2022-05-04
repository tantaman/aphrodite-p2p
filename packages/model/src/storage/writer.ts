import { nullthrows } from "@strut/utils";
import { Changeset, DeleteChangeset } from "../mutator/Changeset";
import { Context } from "../context";
import { NodeSchema, RequiredNodeData } from "../Schema";
import { Node } from "../Node";
import sqliteWriter from "./sql/sqliteWriter";

export default {
  // TODO: the common case is probably updating a single node
  // for a single engine. Should we optimize for that path instead?
  async upsertBatch(
    context: Context,
    nodes: IterableIterator<Node<RequiredNodeData>>
  ): Promise<void> {
    const byEngine = new Map();
    for (const node of nodes) {
      const engine = node._definition.schema.storage.persisted?.engine;
      let grouping = byEngine.get(engine);
      if (grouping == null) {
        grouping = [];
        byEngine.set(engine, grouping);
      }
      grouping.push(node);
    }

    for (const [engine, group] of byEngine) {
      switch (engine) {
        case "sqlite":
          sqliteWriter.upsertGroup(group);
          break;
      }
    }
  },

  async deleteBatch(
    context: Context,
    deletes: DeleteChangeset<NodeSchema>[]
  ): Promise<void> {},
};
