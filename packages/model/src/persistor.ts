import { Changeset } from "./Changeset";
import nodeStorage from "./nodeStorage";
import { NodeEdgesSchema, NodeSchema, PersistConfig } from "./Schema";
import { CombinedChangesets } from "./ChangesetExecutor";
import TransactionLog from "./TransactionLog";

export default class Persistor {
  constructor(private log: TransactionLog) {
    // should we debounce this?
    this.log.observe(this._onLogChange);
  }

  _onLogChange = (changes: CombinedChangesets) => {
    const batches: Map<string, Changeset<NodeSchema, NodeEdgesSchema>[]> =
      new Map();
    for (let [id, changeset] of changes) {
      // Skip non-persisted models
      let nodeSchema: NodeSchema;
      if (changeset.type === "create") {
        nodeSchema = changeset.definition.schema.node;
      } else {
        nodeSchema = changeset.node._definition.schema.node;
      }

      if (!nodeSchema.storage.persisted) {
        continue;
      }

      // TODO: Combine things that are in the same tablish so we can
      // pull into a single insert.
      const key = createKey(nodeSchema.storage.persisted);
      let batch = batches.get(key);
      if (batch == null) {
        batch = [];
        batches.set(key, batch);
      }
      batch.push(changeset);
    }

    const writes: Promise<void>[] = [];
    for (const batch of batches.values()) {
      writes.push(nodeStorage.writeBatch(batch));
    }

    // TODO: how will we handle recovery?
    // The in-memory representations are already updated at this point.
    // Should we roll them back?
    // also -- should we allow these changesets to take place in DB transactions?
    Promise.all(writes).catch((err) => console.error(err));
  };
}

function createKey(persistConfig: PersistConfig): string {
  return (
    persistConfig.db + "-" + persistConfig.engine + "-" + persistConfig.tablish
  );
}
