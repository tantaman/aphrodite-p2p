import { ID_of } from "ID";
import { ViewerContext } from "ViewerContext";

export default abstract class Model<T extends { id: ID_of<any /*this*/> }> {
  protected readonly data: T;
  protected readonly vc: ViewerContext;

  constructor(vc: ViewerContext, data: T) {
    this.data = Object.seal(data);
  }

  get id(): ID_of<this> {
    return this.data.id;
  }

  _d(): T {
    return this.data;
  }
}
