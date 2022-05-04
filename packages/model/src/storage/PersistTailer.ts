import { DeleteChangeset, getSchema } from "../mutator/Changeset";
import { NodeSchema, RequiredNodeData } from "../Schema";
import { Transaction } from "../mutator/ChangesetExecutor";
import TransactionLog from "../TransactionLog";
import { Context } from "../context";
import { Disposer } from "@strut/events";
import { ID_of } from "../ID";
import { Node } from "../Node";
import writer from "./writer";
import { nullthrows } from "@strut/utils";

export default class PersistTailer {
  private unobserve: Disposer;

  private collectedDeletes: DeleteChangeset<NodeSchema>[] = [];
  private collectedCreatesOrUpdates: Map<
    ID_of<Node<RequiredNodeData>>,
    Node<RequiredNodeData>
  > = new Map();
  private write: () => Promise<void[]>;
  public pendingWrites: Promise<void[]> | null = null;

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

  private writeImmediate = () => {
    const collectedDeletes = this.collectedDeletes;
    this.collectedDeletes = [];
    const collectedCreatesOrUpdates = this.collectedCreatesOrUpdates;
    this.collectedCreatesOrUpdates = new Map();

    return Promise.all([
      writer.deleteBatch(this.context, collectedDeletes),
      writer.upsertBatch(this.context, collectedCreatesOrUpdates.values()),
    ]);
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
    this.pendingWrites = this.write();
  };

  // Debounced `onLogChange`
  // which would deconflict what it has received
  // Deletes override all.
  // Create record must be retained. (insert vs set)

  dispose() {
    this.unobserve();
  }
}

function debounce<T>(cb: () => Promise<T>, time: number): () => Promise<T> {
  let pending: ReturnType<typeof setTimeout> | null = null;
  let promise: Promise<T>;
  let resolveOuter: (value: T | PromiseLike<T>) => void;
  return () => {
    if (pending == null) {
      promise = new Promise((resolve, _reject) => {
        resolveOuter = resolve;
      });
    }

    if (pending != null) {
      clearTimeout(pending);
      pending = null;
    }

    pending = setTimeout(() => {
      pending = null;
      resolveOuter(cb());
    }, time);

    return promise;
  };
}
