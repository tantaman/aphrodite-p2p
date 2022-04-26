import { Context } from "context";
import { ID_of } from "ID";
import { NodeDefinition } from "Schema";

export default {
  async readOne<T>(
    context: Context,
    definition: NodeDefinition<any, any>,
    id: ID_of<T>
  ): Promise<T> {
    throw new Error("read from storage not yet avail");
  },
};
