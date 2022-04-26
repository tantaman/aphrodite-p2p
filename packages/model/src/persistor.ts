// import { CombinedChangesets } from "./ChangesetExecutor";
// import TransactionLog from "./TransactionLog";

// export default class Persistor {
//   constructor(private log: TransactionLog) {
//     // should we debounce this?
//     this.log.observe(this._onLogChange);
//   }

//   _onLogChange = (changes: CombinedChangesets) => {
//     const ops: any[] = [];
//     for (let [id, changeset] of changes) {
//       // need `def`
//       if (changeset.type === "create") {
//         // if (changeset.definition.schema.node)
//       }
//       if (!(model instanceof PersistedModel)) {
//         continue;
//       }

//       const table = model.schemaName + "s";
//       if (diff === undefined) {
//         ops.push(this.storage[table].delete(model.id));
//       } else {
//         ops.push(this.storage[table].put(model.toStorage()));
//       }
//     }
//     if (ops.length === 0) {
//       return;
//     }
//     Promise.all(ops).then(
//       (value) => {}, //console.log(value),
//       (err) => console.error(err)
//     );
//   };
// }
