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
  } as const;
  const DeckEdges = {};

  const Deck = DefineNode(DeckDefinition, DeckEdges);

  expect(Deck._createFromData).not.toBeNull();
  expect(Deck.schema).not.toBeNull();
  expect(Deck.schema.node).toEqual(DeckDefinition);
  expect(Deck.schema.edges).toEqual(DeckEdges);
});

afterAll(() => {
  cache.destroy();
});
