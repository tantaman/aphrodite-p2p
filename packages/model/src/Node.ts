import { Context } from "./context";
import { FieldType } from "./field";
import { ID_of } from "./ID";
import * as Y from "yjs";
import { invariant } from "@aphro/lf-error";
import { RequiredNodeData } from "./Schema";
import { YOrigin } from "ChangesetExecutor";
import { CreateChangeset, UpdateChangeset } from "Changeset";
type Disposer = () => void;
function typedKeys<T>(o: T): (keyof T)[] {
  // @ts-ignore
  return Object.keys(o);
}

/*
Persisted only
Synced only
Persisted & Synced
Not persisted or synced (ephemeral)
*/

export interface Node<T extends RequiredNodeData> {
  _destroy(): void;
  getContext(): Context;
}

abstract class NodeBase<T extends RequiredNodeData> implements Node<T> {
  private subscriptions: Set<() => void> = new Set();
  private keyedSubscriptions: Map<keyof T, Set<() => void>> = new Map();
  protected _data: T;
  protected readonly _context: Context;

  constructor(context: Context, data: T) {
    this._context = context;
    this._data = data;
  }

  getContext(): Context {
    return this._context;
  }

  _destroy() {
    this.subscriptions = new Set();
    this.keyedSubscriptions = new Map();
  }

  subscribe(c: () => void): Disposer {
    this.subscriptions.add(c);
    return () => this.subscriptions.delete(c);
  }

  subscribeTo(keys: (keyof T)[], c: () => void): Disposer {
    keys.forEach((k) => {
      let subs = this.keyedSubscriptions.get(k);
      if (subs == null) {
        subs = new Set();
        this.keyedSubscriptions.set(k, subs);
      }

      subs.add(c);
    });

    return () => keys.forEach((k) => this.keyedSubscriptions.get(k)?.delete(c));
  }

  protected merge(
    newData: Partial<T> | undefined
  ): [Partial<T>, Set<() => void>] | null {
    const lastData = this._data;
    this._data = {
      ...this._data,
      ...newData,
    };
    let castLast = lastData as any;
    if (castLast.id !== undefined) {
      castLast.id = undefined;
    }

    let unchangedKeys = new Set();
    if (newData != null) {
      Object.entries(newData).forEach((entry) => {
        if (lastData[entry[0]] === entry[1]) {
          unchangedKeys.add(entry[0]);
        }
      });
    }

    const notifications = this.gatherNotifications(
      newData !== undefined
        ? unchangedKeys.size === 0
          ? typedKeys(newData)
          : typedKeys(newData).filter((k) => !unchangedKeys.has(k))
        : undefined
    );
    return [lastData, notifications];
  }

  private gatherNotifications(changedKeys?: (keyof T)[]): Set<() => void> {
    const notifications = new Set(this.gatherIndiscriminateNotifications());
    if (changedKeys && this.keyedSubscriptions.size > 0) {
      this.gatherKeyedNotifications(changedKeys, notifications);
    }
    return notifications;
  }

  private gatherIndiscriminateNotifications() {
    return this.subscriptions;
  }

  private gatherKeyedNotifications(
    changedKeys: (keyof T)[],
    notifications: Set<() => void>
  ) {
    for (const key of changedKeys) {
      const subs = this.keyedSubscriptions.get(key);
      if (subs) {
        for (const c of subs) {
          notifications.add(c);
        }
      }
    }
  }
}

// All just nodes but change based on storage adapter?
// interface PersistedNode {}
// interface ReplicatedNode {}
// interface Node {}

// We do need a schema for the model so we know what
// to create within our map... right?
//
// We want a schema because we're going to create the model from
// some data originally.
// Not from some Y data...
// From some off-disk data.
//
// Mutators will change `y` as well?
// Probs all changes should go thru y
// and then be synced into the model
// which is then synced into storage
export abstract class ReplicatedNode<
  T extends RequiredNodeData
> extends NodeBase<T> {
  private ymap: Y.Map<FieldType>;
  private ydoc: Y.Doc;

  constructor(context: Context, data: T) {
    super(context, data);
    this.ydoc = context.doc(data._parentDocId);
    this.ymap = this.ydoc.getMap(data._id);

    // TODO We should observe y weakly...
    this.ymap.observeDeep(this.yObserver);
  }

  get _id(): ID_of<this> {
    return this._data._id;
  }

  get _parentDocId(): ID_of<Doc<any>> | null {
    return this._data._parentDocId;
  }

  _d(): T {
    return this._data;
  }

  _update(changeset: CreateChangeset<any, any> | UpdateChangeset<any, any>) {
    Object.entries(changeset.updates).forEach(([key, value]) => {
      if (key === "_id" || key === "_parentDoc") {
        return;
      }
      this.ymap.set(key, value);
    });
  }

  _destroy() {
    super._destroy();
    this.ymap.unobserveDeep(this.yObserver);
    // @ts-ignore
    this.ymap = null;
    // @ts-ignore
    this.ydoc = null;
  }

  // If we have a replicated string sub-entry...
  // will this process that correctly?
  // or we need to deeply observe?
  private yObserver = (events: Y.YEvent<any>[], tx: Y.Transaction) => {
    const mutableData = { ...this._data };
    for (const e of events) {
      // TODO: this could be a path to a nested structure in the map
      e.changes.keys.forEach((change, key) =>
        this.processChange(mutableData, change, key)
      );
    }
    // compare to see if we should set
  };

  private processChange = (
    mutableData: T,
    change: {
      action: "add" | "update" | "delete";
      oldValue: any;
    },
    key: string
  ) => {
    switch (change.action) {
      case "add":
      case "update":
        mutableData[key] = this.ymap.get(key);
        break;
      case "delete":
        delete mutableData[key];
        break;
    }
  };
}

// TODO:
// export abstract class OnePerSessionNode?
// OncePerSession being to handle things like AppState for the local person.

/**
 * A Doc is a Node that handles it own replication.
 */
export abstract class Doc<
  T extends RequiredNodeData
> extends ReplicatedNode<T> {
  // This'll create a new doc which is put into the root doc via id.
  constructor(context: Context, data: T) {
    invariant(
      data._id === data._parentDocId,
      "Docs must be their own parents."
    );
    super(context, data);
  }
}

/**
 * Handling sub-docs....
 * Strut use case think through ---
 *
 * Strut has
 * 1. Application state
 * 2. Slides
 *
 * All application state would be in "application state" domain
 * Each slide, however, would be in its own domain.
 *
 * Those domains would be new docs.
 *
 * Deck domain(app) {
 * }
 *
 * // Slide is in app domain since it'd represent metadata
 * Slide domain(app) {
 *   edge -> content
 * }
 *
 * // actual slide content can be a separate domain
 * // and lazy loaded
 * Content domain(this) {
 * }
 *
 * // sub-doc has to be added to the parent doc...
 * // which would happen after traversing the edge.
 *
 * Actually... just create a root doc map in the root doc
 * and insert there by id.
 *
 * Also -- not all application state should be synced. If it all were
 * then all clients would be always looking at the same selected slide.
 *
 * There's a sense of ephemeral state then...
 *
 * But that ephemeral state should get persisted so you're at the right slide
 * when you come back? :|
 *
 * Maybe there's a way to disconnect a specific model from remote updates?
 *
 * What if a sub-doc has sub-nodes?
 * Edges must take in a Doc then...
 * Do validation to see if the same GUID/Model ends up in multiple docs?
 *
 * Travsering and edge to a node...
 * Can two different docs have edges to the same node?
 * If we forbit it then we can easily forward the Doc's context...
 *
 * What if we're trying to load the node by ID?
 * It surely always needs to know its parent context...
 *
 * OK OK! Nodes will save
 * 1. Their ID
 * 2. Their parent doc id
 *
 * If a node is loaded and parent doc is missing
 * We'll load the parent doc too.
 * Or we'll throw?
 *
 * This can almost be encoded as a privacy type rule...
 * / data validation rule.
 *
 * Node load checks provided context against saved doc id.
 *
 * A doc is basically a table...
 * Sort of though. Not all `components` would be in the same doc, for example.
 *
 * So docs _can't_ be statically encoded.
 * But can we got some write time validation that the thinger
 * was placed into a doc?
 */
