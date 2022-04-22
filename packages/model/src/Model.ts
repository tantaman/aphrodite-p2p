import { Context } from "context";
import { ConflictFreeMap, FieldType } from "field";
import { ID_of } from "ID";

export default abstract class Model<
  T extends {
    id: ID_of<any /*this*/>;
    [key: string]: FieldType;
  }
> {
  protected data: ConflictFreeMap<T[keyof T]>;
  protected readonly context: Context;

  constructor(context: Context, data: T) {
    this.context = context;
    // If we traverse an edge to a model that exists in a different domain
    // how do we handle that?
    this.data = context.domain.doc.getMap(this.constructor.name);
  }

  get id(): ID_of<this> {
    return this.data.get("id") as ID_of<this>;
  }

  _d(): T {
    return this.data;
  }
}

/**
 * Handling sub-docs....
 * Strut use case think through ---
 */
