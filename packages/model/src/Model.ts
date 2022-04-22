import { Context } from "context";
import { ID_of } from "ID";

export default abstract class Model<
  T extends {
    id: ID_of<any /*this*/>;
  }
> {
  protected data: T;
  protected readonly context: Context;

  constructor(context: Context, data: T) {
    this.data = Object.seal(data);
    this.context = context;
  }

  get id(): ID_of<this> {
    return this.data.id;
  }

  _d(): T {
    return this.data;
  }
}
