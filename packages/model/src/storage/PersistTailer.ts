import { DeleteChangeset, getSchema } from "../mutator/Changeset";
import { NodeSchema, RequiredNodeData } from "../Schema";
import { Transaction } from "../mutator/ChangesetExecutor";
import TransactionLog from "../TransactionLog";
import { Context } from "../context";
import { Disposer } from "@strut/events";
import { ID_of } from "../ID";
import { debounce, nullthrows } from "@strut/utils";
import { Node } from "../Node";
import writer from "./writer";

export default class PersistTailer {
  private unobserve: Disposer;

  private collectedDeletes: DeleteChangeset<NodeSchema>[];
  private collectedCreatesOrUpdates: Map<
    ID_of<Node<RequiredNodeData>>,
    Node<RequiredNodeData>
  >;
  private write: (_: unknown) => void;

  constructor(
    private context: Context,
    private log: TransactionLog,
    debounceWindow: number = 100
  ) {
    this.unobserve = this.log.observe(this._onLogChange);
    if (debounceWindow === 0) {
      this.write = this.writeImmediate;
    } else {
      this.write = debounce(this.writeImmediate, debounceWindow);
    }
  }

  private writeImmediate = (_: unknown) => {
    const collectedDeletes = this.collectedDeletes;
    this.collectedDeletes = [];
    const collectedCreatesOrUpdates = this.collectedCreatesOrUpdates;
    this.collectedCreatesOrUpdates = new Map();

    // TODO: get status from our promises... don't lose them like this
    writer.deleteBatch(this.context, collectedDeletes);
    writer.upsertBatch(this.context, this.collectedCreatesOrUpdates.values());
  };

  private _onLogChange = (tx: Transaction) => {
    tx.changes.forEach((value, key) => {
      const schema = getSchema(value);
      if (schema.storage.persisted == null) {
        // skip non persisted schemas
        return;
      }

      if (value.type === "delete") {
        this.collectedDeletes.push(value);
        return;
      }

      this.collectedCreatesOrUpdates.set(key, nullthrows(tx.nodes.get(key)));
    });
    this.write(null);
    // Deletes -- special case, not an insert
    // Creates and updates -- upsert
    // Create -- insert
    // Update -- update
    // knex doesn't support upsert for sql dialects??
    // ---
    // const batches: Map<string, Changeset<NodeSchema>[]> = new Map();
    // for (let [id, changeset] of changes) {
    //   // Skip non-persisted models
    //   let nodeSchema: NodeSchema;
    //   if (changeset.type === "create") {
    //     nodeSchema = changeset.definition.schema;
    //   } else {
    //     nodeSchema = changeset.node._definition.schema;
    //   }
    //   if (!nodeSchema.storage.persisted) {
    //     continue;
    //   }
    //   // TODO: Combine things that are in the same tablish so we can
    //   // pull into a single insert.
    //   const key = createKey(nodeSchema.storage.persisted);
    //   let batch = batches.get(key);
    //   if (batch == null) {
    //     batch = [];
    //     batches.set(key, batch);
    //   }
    //   batch.push(changeset);
    // }
    // const writes: Promise<void>[] = [];
    // for (const batch of batches.values()) {
    //   writes.push(nodeStorage.writeBatch(this.context, batch));
    // }
    // // TODO: how will we handle recovery?
    // // The in-memory representations are already updated at this point.
    // // Should we roll them back?
    // // also -- should we allow these changesets to take place in DB transactions?
    // Promise.all(writes).catch((err) => console.error(err));
  };

  // Debounced `onLogChange`
  // which would deconflict what it has received
  // Deletes override all.
  // Create record must be retained. (insert vs set)

  dispose() {
    this.unobserve();
  }
}
