import { DefineNode, replicatedStringField, stringField } from "Schema";
import createContext from "context";
import { Viewer, viewer } from "viewer";
import root from "root";
import { ID_of } from "ID";

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

const context = createContext(viewer(1 as any), root());
const d = Deck.createFromData(context, {
  _id: "sdf" as any,
  _parentDoc: null,
  name: "Test",
});
const a = d.name;
