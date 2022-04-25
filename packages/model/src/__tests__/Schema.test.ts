import { DefineNode, stringField } from "../Schema";

test("Defining a node", () => {
  const DeckDefinition = {
    storage: {
      replicated: true,
      persisted: true,
    },
    fields: {
      name: stringField,
    },
  } as const;
  const DeckEdges = {};

  const Deck = DefineNode(DeckDefinition, DeckEdges);

  expect(Deck._createFromData).not.toBeNull();
  expect(Deck.schema).not.toBeNull();
  expect(Deck.schema.node).toEqual(DeckDefinition);
  expect(Deck.schema.edges).toEqual(DeckEdges);
});
