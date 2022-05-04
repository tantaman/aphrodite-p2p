import { noopResolver } from "../../storage/DebugResolvers";
import cache from "../../cache";
import createContext from "../../context";
import { ID_of } from "../../ID";
import { stringField } from "../../Schema";
import { Viewer, viewer } from "../../viewer";

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

const context = createContext(viewer("123" as ID_of<Viewer>), noopResolver);

test("Merging changesets", () => {});

afterAll(() => {
  cache.destroy();
});
