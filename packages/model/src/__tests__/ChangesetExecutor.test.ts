import { Node } from "../Node";
import createContext from "../context";
import { ID_of } from "../ID";
import root from "../root";
import { DefineNode, RequiredNodeData, stringField } from "../Schema";
import { Viewer, viewer } from "../viewer";
import { ChangesetExecutor } from "../ChangesetExecutor";

const DeckSchema = {
  storage: {
    replicated: true,
    persisted: true,
  },
  fields: {
    name: stringField,
  },
} as const;
const DeckEdges = {};

const context = createContext(viewer("123" as ID_of<Viewer>), root());

test("Merging changesets", () => {});
