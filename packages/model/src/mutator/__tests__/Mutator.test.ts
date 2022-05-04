import createContext from "../../context";
import { ID_of } from "../../ID";
import { DefineNode, stringField } from "../../Schema";
import { Viewer, viewer } from "../../viewer";
import cache from "../../cache";
import { noopResolver } from "../../storage/Resolvers";

const DeckSchema = {
  storage: {
    replicated: true,
    persisted: {
      engine: "dexie",
      db: "test",
      tablish: "test",
    },
  },
  fields: () =>
    ({
      name: stringField,
    } as const),
  edges: () => ({}),
} as const;

const context = createContext(viewer("123" as ID_of<Viewer>), noopResolver);
test("create mutation builder changeset generation", () => {
  const Deck = DefineNode(DeckSchema);

  const changeset = Deck.create(context).set({ name: "foo" }).toChangeset();
  expect(changeset.type).toBe("create");
  expect(changeset._id).toBeTruthy();
  expect(changeset._parentDocId).toBeNull();
  expect(changeset.definition).toEqual(Deck);
  expect(changeset.updates.name).toEqual("foo");
});

test("update mutation builder", () => {
  const Deck = DefineNode(DeckSchema);
  const deck = Deck.create(context).set({ name: "foo" }).save();

  const updated = Deck.update(deck).set({ name: "bar" }).save();
});

test("delete mutation builder", () => {});

afterAll(() => {
  cache.destroy();
});
