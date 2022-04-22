import { DefineNode, replicatedStringField, stringField } from "Schema";

const SlideDefinition = {
  storage: {
    replicated: true,
    persisted: true,
  },
  fields: {
    name: stringField,
    content: replicatedStringField,
  },
} as const;

const DeckDefinition = {
  storage: {
    replicated: true,
    persisted: true,
  },
  fields: {
    name: stringField,
  },
} as const;

const DeckEdges = {
  slides: {
    type: "foreign",
    field: "deckId",
    dest: SlideDefinition,
  },
} as const;

const SlideEdges = {
  deck: {
    type: "field",
    field: "deckId",
    dest: DeckDefinition,
  },
} as const;

const Deck = DefineNode(DeckDefinition, DeckEdges);
const d = Deck.createFromData();
const a = d.name;
