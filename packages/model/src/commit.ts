import { ChangesetExecutor } from "./ChangesetExecutor";
import { Changeset } from "./Changeset";
import { Context } from "./context";

export function commit(
  context: Context,
  changesets: Changeset<any, any>[]
  // log: TransactionLog | TransactionLog[]
) {
  return new ChangesetExecutor(
    context,
    changesets
    // !Array.isArray(log) ? [log] : log
  ).execute();
}
