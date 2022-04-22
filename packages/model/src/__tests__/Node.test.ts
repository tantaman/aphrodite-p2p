import { DefineNode, NodeSchema, SchemaFieldType } from "Schema";

const SlideDefinition = {
  storage: {
    replicated: true,
    persisted: true,
  },
  fields: {
    name: "string",
    content: "replicatedString",
  },
} as const;

const DeckDefinition = {
  storage: {
    replicated: true,
    persisted: true,
  },
  fields: {
    name: "string",
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
