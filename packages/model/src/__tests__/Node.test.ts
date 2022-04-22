import { DefineNode, NodeSchema, SchemaFieldType } from "Schema";

/*

*/
const DeckDefinition = {
  storage: {
    replicated: true,
    persisted: true,
  },
  fields: {
    name: "string",
  },
  // of course edges...
} as const;

const Deck = DefineNode(DeckDefinition);
