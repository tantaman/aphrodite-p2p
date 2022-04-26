import createContext, { Context } from "../context";
import { ID_of } from "../ID";
import root from "../root";
import { DefineNode, RequiredNodeData, stringField } from "../Schema";
import { Viewer, viewer } from "../viewer";
import cache from "../cache";

const DeckSchema = {
  storage: {
    replicated: true,
    persisted: {
      engine: "dexie",
      db: "test",
      tablish: "test",
    },
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

test("update mutation builder", () => {
  const Deck = DefineNode(DeckSchema, DeckEdges);
  const deck = Deck.create(context).set({ name: "foo" }).save();

  const updated = Deck.update(deck).set({ name: "bar" }).save();
});

test("delete mutation builder", () => {});

afterAll(() => {
  cache.destroy();
});
