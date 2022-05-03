import { Context } from "./context";
import { ID_of } from "./ID";
import { invariant } from "@strut/utils";
import {
  NodeDefinition,
  NodeEdgesSchema,
  NodeSchema,
  RequiredNodeData,
} from "./Schema";
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
  readonly _context: Context;
  readonly _id: ID_of<this>;
  readonly _parentDocId: ID_of<Doc<RequiredNodeData>> | null;
  readonly _definition: NodeDefinition<NodeSchema>;
  _destroy(): void;
  _merge(newData: Partial<T>): [Partial<T>, Set<() => void>];
  _isNoop(updates: Partial<T>): boolean;

  subscribe(c: () => void): Disposer;
  subscribeTo(keys: (keyof T)[], c: () => void): Disposer;
}

export abstract class NodeBase<T extends RequiredNodeData> implements Node<T> {
  private subscriptions: Set<() => void> = new Set();
  private keyedSubscriptions: Map<keyof T, Set<() => void>> = new Map();
  protected _data: T;
  public readonly _context: Context;
  public abstract readonly _definition: NodeDefinition<NodeSchema>;

  constructor(context: Context, data: T) {
    this._context = context;
    this._data = data;
  }

  get _id(): ID_of<this> {
    return this._data._id;
  }

  get _parentDocId(): ID_of<Doc<RequiredNodeData>> | null {
    return this._data._parentDocId;
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

  _merge(newData: Partial<T>): [Partial<T>, Set<() => void>] {
    const lastData = this._data;
    this._data = {
      ...this._data,
      ...newData,
    };

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

  _isNoop(updates: Partial<T>) {
    return Object.entries(updates).every(
      (entry) => this._data[entry[0]] === entry[1]
    );
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

/**
 * A Doc is a Node that handles it own replication.
 */
export abstract class Doc<T extends RequiredNodeData> extends NodeBase<T> {
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

// _update(changeset: CreateChangeset<any, any> | UpdateChangeset<any, any>) {
//   Object.entries(changeset.updates).forEach(([key, value]) => {
//     if (key === "_id" || key === "_parentDoc") {
//       return;
//     }
//     this.ymap.set(key, value);
//   });
// }

// TODO:
// export abstract class OnePerSessionNode?
// OncePerSession being to handle things like AppState for the local person.
