import cache from "../cache";
import { DefineNode, stringField } from "../Schema";

test("Defining a node", () => {
  const DeckDefinition = {
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

  const Deck = DefineNode(DeckDefinition);

  expect(Deck._createFromData).not.toBeNull();
  expect(Deck.schema).not.toBeNull();
  expect(Deck.schema).toEqual(DeckDefinition);
  expect(Deck.schema.edges).toEqual({});
});

afterAll(() => {
  cache.destroy();
});
