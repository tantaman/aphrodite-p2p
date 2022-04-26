import createContext from "../context";
import { ID_of } from "../ID";
import root from "../root";
import { stringField } from "../Schema";
import { Viewer, viewer } from "../viewer";

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