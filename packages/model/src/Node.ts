import { Context } from "context";
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
    // If we traverse an edge to a model that exists in a different domain
    // how do we handle that?
    this.y = context.domain.doc.getMap(this.constructor.name);
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

export abstract class Doc<
  T extends {
    id: ID_of<any /*this*/>;
    [key: string]: FieldType;
  }
> extends Node<T> {
  // This'll create a new doc which is put into the root doc via id.
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
 */
