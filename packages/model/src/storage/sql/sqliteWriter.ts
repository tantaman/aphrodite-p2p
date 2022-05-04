import { Node } from "../../Node";
import { RequiredNodeData, PersistConfig } from "../../Schema";

export default {
  upsertGroup(nodes: Node<RequiredNodeData>[]) {
    // group the nodes again by db...
    // and then run a single upsert against all hit tables within that db
    // const db = context.dbResolver
    //   .type(storageType(persist.engine))
    //   .engine(persist.engine)
    //   .db(persist.db);
    // const firstChange = changes[0];
    // if (firstChange == null) {
    //   return;
    // }
    // let schema: NodeSchema;
    // if (firstChange.type === "create") {
    //   schema = firstChange.definition.schema;
    // } else {
    //   schema = firstChange.node._definition.schema;
    // }
    // const persist = nullthrows(schema.storage.persisted);
    // // TODO: We'll figure a better abstraction (pluggable abstraction) for this
    // // in future iterations
    // switch (persist.engine) {
    //   case "sqlite":
    //     // convert to SQL ala `specAndOpsToSQL`
    //     // await db.exec("YO! convert to SQL ala `specAndOpsToSQL`", []);
    //     break;
    // }
  },

  deleteGroup() {},
};

function createKey(persistConfig: PersistConfig): string {
  return (
    persistConfig.db + "-" + persistConfig.engine + "-" + persistConfig.tablish
  );
}
