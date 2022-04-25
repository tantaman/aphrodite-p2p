import { DefineNode, replicatedStringField, stringField } from "../Schema";
import createContext from "../context";
import { viewer } from "../viewer";
import root from "../root";

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

test("creating a node", () => {
  const deck = Deck._createFromData(context, {
    _id: "sdf" as any,
    _parentDocId: null,
    name: "Test",
  });
  expect(deck).toBeTruthy();
});

test("Read fields on the created node", () => {
  const deck = Deck._createFromData(context, {
    _id: "sdf" as any,
    _parentDocId: null,
    name: "Test",
  });
  expect(deck.name).toEqual("Test");
});

/*
Mutator...
*/

// test("Query methods", () => {
//   const deck = Deck.createFromData(context, {
//     _id: "sdf" as any,
//     _parentDoc: null,
//     name: "Test",
//   });

//   const query = deck.querySlides();
// });
