import { nullthrows } from "@strut/utils";
import { ID_of } from "./ID";
import { Node } from "./Node";
import { RequiredNodeData } from "./Schema";

export default class ImmutableNodeMap {
  protected map: Map<
    ID_of<Node<RequiredNodeData>>,
    Node<RequiredNodeData> | null
  > = new Map();

  get<T extends Node<RequiredNodeData>>(id: ID_of<T>): T | null | undefined {
    const ret = this.map.get(id);
    if (ret == null) {
      return ret;
    }

    return ret as T;
  }

  getx<T extends Node<RequiredNodeData>>(id: ID_of<T>): T {
    return nullthrows(this.map.get(id)) as T;
  }
}

export class MutableNodeMap extends ImmutableNodeMap {
  set<T extends Node<RequiredNodeData>>(id: ID_of<T>, n: T | null): void {
    this.map.set(id, n);
  }
}
