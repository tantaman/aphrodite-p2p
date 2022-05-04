import { nullthrows } from "@strut/utils";
import { Context } from "../../context";
import storageType from "../../storage/storageType";
import { Node } from "../../Node";
import { RequiredNodeData, PersistConfig } from "../../Schema";
import knex from "knex";

export default {
  // Precondition: already grouped by db & table
  upsertGroup(context: Context, nodes: Node<RequiredNodeData>[]) {
    const first = nodes[0];
    const persist = nullthrows(first._definition.schema.storage.persisted);
    const db = context.dbResolver
      .type(storageType(persist.engine))
      .engine(persist.engine)
      .db(persist.db);

    const builder = knex({ client: "sqlite" });
    console.log(
      builder(persist.tablish)
        .insert(nodes.map((n) => (n as any)._data))
        .onConflict("_id")
        .merge()
        .returning("*")
        .toSQL()
    );
  },

  deleteGroup() {},
};
