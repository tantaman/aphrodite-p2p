import { DefineNode, idField, numberField, stringField } from "../Schema";
import cache from "../cache";
import context, { debugContext } from "../context";
import { viewer } from "../viewer";
import { id } from "../ID";
import { commit } from "../mutator/commit";
import { noopResolver } from "storage/DebugResolvers";

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
  fields: () =>
    ({
      name: stringField,
    } as const),
  edges: () =>
    ({
      slides: {
        type: "foreign",
        field: "deckId",
        dest: SlideSchema,
      },
    } as const),
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
  fields: () =>
    ({
      type: stringField,
      content: stringField,
      slideId: idField,
    } as const),
  edges: () => ({}),
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
  fields: () =>
    ({
      order: numberField,
      deckId: idField,
    } as const),
  edges: () =>
    ({
      components: {
        type: "foreign",
        field: "slideId",
        dest: ComponentSchema,
      },
    } as const),
} as const;

const Deck = DefineNode(DeckSchema);
const Slide = DefineNode(SlideSchema);
const Component = DefineNode(ComponentSchema);

const ctx = context(viewer(id("me")), noopResolver);
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

  const deck = commit(ctx, [deckCs, slideCs, componentCs]).nodes.get(
    deckCs._id
  );
});

afterAll(() => cache.destroy());
