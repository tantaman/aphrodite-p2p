import { ChangesetExecutor } from "./ChangesetExecutor";
import { Changeset } from "./Changeset";
import { Context } from "./context";
import { NodeEdgesSchema, NodeSchema } from "Schema";

export function commit(
  context: Context,
  changesets: Changeset<NodeSchema, NodeEdgesSchema>[]
  // log: TransactionLog | TransactionLog[]
) {
  return new ChangesetExecutor(
    context,
    changesets
    // !Array.isArray(log) ? [log] : log
  ).execute();
}
