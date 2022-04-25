import createContext from "../context";
import { ID_of } from "../ID";
import root from "../root";
import { DefineNode, stringField } from "../Schema";
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
test("create mutation builder changeset generation", () => {
  const Deck = DefineNode(DeckSchema, DeckEdges);

  const changeset = Deck.create(context).set({ name: "foo" }).toChangeset();
  expect(changeset.type).toBe("create");
  expect(changeset._id).toBeTruthy();
  expect(changeset._parentDocId).toBeNull();
  expect(changeset.definition).toEqual(Deck);
  expect(changeset.updates.name).toEqual("foo");
});

test("update mutation builder", () => {});

test("delete mutation builder", () => {});
