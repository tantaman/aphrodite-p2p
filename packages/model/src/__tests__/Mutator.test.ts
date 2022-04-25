import { CreateMutationBuilder } from "Mutator";
import { DefineNode, stringField } from "Schema";

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

test("create mutation builder changeset generation", () => {
  const Deck = DefineNode(DeckSchema, DeckEdges);

  // const create = new CreateMutationBuilder();
});

test("update mutation builder", () => {});

test("delete mutation builder", () => {});
