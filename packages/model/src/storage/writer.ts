import { nullthrows } from "@strut/utils";
import { Changeset, DeleteChangeset } from "../mutator/Changeset";
import { Context } from "../context";
import { NodeSchema, PersistConfig, RequiredNodeData } from "../Schema";
import { Node } from "../Node";
import sqliteWriter from "./sql/sqliteWriter";

export default {
  // TODO: the common case is probably updating a single node
  // for a single engine. Should we optimize for that path instead?
  async upsertBatch(
    context: Context,
    nodes: IterableIterator<Node<RequiredNodeData>>
  ): Promise<void> {
    const byEngineDbTable: Map<string, Node<RequiredNodeData>[]> = new Map();
    for (const node of nodes) {
      const key = createKey(
        nullthrows(node._definition.schema.storage.persisted)
      );
      let grouping: Node<RequiredNodeData>[] | undefined =
        byEngineDbTable.get(key);
      if (grouping == null) {
        grouping = [];
        byEngineDbTable.set(key, grouping);
      }
      grouping.push(node);
    }

    for (const [key, group] of byEngineDbTable) {
      const engine = nullthrows(
        group[0]._definition.schema.storage.persisted?.engine
      );
      switch (engine) {
        case "sqlite":
          sqliteWriter.upsertGroup(context, group);
          break;
      }
    }
  },

  async deleteBatch(
    context: Context,
    deletes: DeleteChangeset<NodeSchema>[]
  ): Promise<void> {},
};

function createKey(persistConfig: PersistConfig): string {
  return (
    persistConfig.engine + "-" + persistConfig.db + "-" + persistConfig.tablish
  );
}
