import { ChangesetExecutor } from "./ChangesetExecutor";
import { Changeset } from "./Changeset";
import { Context } from "../context";
import { NodeSchema } from "Schema";

export type CommitOptions = {
  readonly persistNow?: boolean;
};

export function commit(
  context: Context,
  changesets: Changeset<NodeSchema>[],
  options: CommitOptions = {}
) {
  return new ChangesetExecutor(context, changesets, options).execute();
}
