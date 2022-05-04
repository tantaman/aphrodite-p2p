import { ChangesetExecutor } from "./ChangesetExecutor";
import { Changeset } from "./Changeset";
import { Context } from "../context";
import { NodeSchema } from "Schema";

export function commit(
  context: Context,
  changesets: Changeset<NodeSchema>[]
  // log: TransactionLog | TransactionLog[]
) {
  return new ChangesetExecutor(
    context,
    changesets
    // !Array.isArray(log) ? [log] : log
  ).execute();
}
