import { Changeset } from "./mutator/Changeset";
import nodeStorage from "./nodeStorage";
import { NodeSchema, PersistConfig } from "./Schema";
import { CombinedChangesets } from "./mutator/ChangesetExecutor";
import TransactionLog from "./TransactionLog";
import { Context } from "./context";
import { Disposer } from "@strut/events";

export default class Persistor {
  private unobserve: Disposer;
  constructor(private context: Context, private log: TransactionLog) {
    // TODO: should we debounce this?
    // We don't technically have to persist on every change.
    // We can accumulate and re-merge changes in memory
    // Before persisting.
    // Or always write entire model and only write latest.
    this.unobserve = this.log.observe(this._onLogChange);
  }

  private _onLogChange = (changes: CombinedChangesets) => {
    const batches: Map<string, Changeset<NodeSchema>[]> = new Map();
    for (let [id, changeset] of changes) {
      // Skip non-persisted models
      let nodeSchema: NodeSchema;
      if (changeset.type === "create") {
        nodeSchema = changeset.definition.schema;
      } else {
        nodeSchema = changeset.node._definition.schema;
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
      writes.push(nodeStorage.writeBatch(this.context, batch));
    }

    // TODO: how will we handle recovery?
    // The in-memory representations are already updated at this point.
    // Should we roll them back?
    // also -- should we allow these changesets to take place in DB transactions?
    Promise.all(writes).catch((err) => console.error(err));
  };

  // Debounced `onLogChange`
  // which would deconflict what it has received
  // Deletes override all.
  // Create record must be retained. (insert vs set)

  dispose() {
    this.unobserve();
  }
}

function createKey(persistConfig: PersistConfig): string {
  return (
    persistConfig.db + "-" + persistConfig.engine + "-" + persistConfig.tablish
  );
}
