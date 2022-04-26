import { DefineNode, idField, numberField, stringField } from "../Schema";
import cache from "../cache";
import context from "../context";
import { viewer } from "../viewer";
import root from "../root";
import { id } from "../ID";
import { commit } from "../commit";

// TODO: incorporate fast check?
// https://github.com/dubzzz/fast-check

const DeckSchema = {
  storage: {
    replicated: true,
    persisted: {
      engine: "dexie",
      db: "test",
      tablish: "test",
    },
  },
  fields: {
    name: stringField,
  },
} as const;

const ComponentSchema = {
  storage: {
    replicated: true,
    persisted: {
      engine: "dexie",
      db: "test",
      tablish: "test",
    },
  },
  fields: {
    type: stringField,
    content: stringField,
    slideId: idField,
  },
} as const;

const SlideSchema = {
  storage: {
    replicated: true,
    persisted: {
      engine: "dexie",
      db: "test",
      tablish: "test",
    },
  },
  fields: {
    order: numberField,
    deckId: idField,
  },
} as const;

const SlideEdges = {
  components: {
    type: "foreign",
    field: "slideId",
    dest: ComponentSchema,
  },
} as const;

const DeckEdges = {
  slides: {
    type: "foreign",
    field: "deckId",
    dest: SlideSchema,
  },
} as const;

const Deck = DefineNode(DeckSchema, DeckEdges);
const Slide = DefineNode(SlideSchema, SlideEdges);
const Component = DefineNode(ComponentSchema, {});

const ctx = context(viewer(id("me")), root());
test("explore", () => {
  const deckCs = Deck.create(ctx)
    .set({
      name: "Exploratory",
    })
    .toChangeset();
  const slideCs = Slide.create(ctx)
    .set({
      deckId: deckCs._id,
    })
    .toChangeset();
  const componentCs = Component.create(ctx)
    .set({
      slideId: slideCs._id,
      type: "text",
      content: "Double Click to Edit",
    })
    .toChangeset();

  // TODO: use a special class to preserve TS types
  const deck = commit(ctx, [deckCs, slideCs, componentCs]).nodes.get(
    deckCs._id // <-- id should be typed here...
  );
});

afterAll(() => cache.destroy());
