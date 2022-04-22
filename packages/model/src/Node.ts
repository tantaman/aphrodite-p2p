import { Context } from "context";
import createContext from "context";
import { FieldType } from "field";
import { ID_of } from "ID";
import * as Y from "yjs";

// We do need a schema for the model so we know what
// to create within our map... right?
//
// We want a schema because we're going to create the model from
// some data originally.
// Not from some Y data...
// From some off-disk data.
export abstract class Node<
  T extends {
    id: ID_of<any /*this*/>;
    [key: string]: FieldType;
  }
> {
  private y: Y.Map<T[keyof T]>;
  protected data: T;
  protected readonly context: Context;

  constructor(context: Context, data: T) {
    this.context = context;
    this.y = context.doc().getMap(data.id);
    this.data = data;

    // Now fill y from data.
    // in 1 single transaction?
    // can we "hydrate" y ?? / initialize it...

    // Y is our sync transport.
    // We'll observer it and merge its changes into `data`
  }

  get id(): ID_of<this> {
    return this.data.id;
  }

  _d(): T {
    return this.data;
  }
}

// TODO:
// export abstract class OnePerSessionNode?
// OncePerSession being to handle things like AppState for the local person.

/**
 * A Doc is a Node that handles it own replication.
 */
export abstract class Doc<
  T extends {
    id: ID_of<any /*this*/>;
    [key: string]: FieldType;
  }
> extends Node<T> {
  // This'll create a new doc which is put into the root doc via id.
  constructor(context: Context, data: T) {
    super(
      createContext(context.viewer, context.root, () => {
        const subDocs = context.root.subDocs;
        let myDoc = subDocs.get(data.id);
        if (myDoc == null) {
          myDoc = new Y.Doc();
          subDocs.set(data.id, myDoc);
        }

        return myDoc;
      }),
      data
    );
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
