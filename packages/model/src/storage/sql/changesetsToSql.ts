import { NodeSchema } from "../../Schema";
import { Changeset } from "../../mutator/Changeset";

// Expectation is the batch of changesets all goes to the same table
export default function changesetsToSql(changes: Changeset<NodeSchema>[]) {}
