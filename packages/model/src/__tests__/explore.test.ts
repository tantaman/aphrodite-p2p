import { DefineNode, idField, floatField, stringField } from "../Schema";
import cache from "../cache";
import context from "../context";
import { viewer } from "../viewer";
import { id } from "../ID";
import { commit } from "../mutator/commit";
import PersistTailer from "../storage/PersistTailer";
import { createResolver } from "./testDb";
import { create as createTable } from "../storage/TablishCreator";

// TODO: incorporate fast check?
// https://github.com/dubzzz/fast-check

const DeckSchema = {
  storage: {
    replicated: true,
    persisted: {
      engine: "sqlite",
      db: "test",
      tablish: "deck",
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
      engine: "sqlite",
      db: "test",
      tablish: "component",
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
      engine: "sqlite",
      db: "test",
      tablish: "slide",
    },
  },
  fields: () =>
    ({
      order: floatField,
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

const ctx = context(viewer(id("me")), createResolver());
const tailer = new PersistTailer(ctx, ctx.commitLog);

beforeAll(async () => {
  // TODO: can our test be smart enough to auto-create tables for all
  // loaded schemas?
  // I think so... `DefineNode` calls could auto-create tables when in a test
  // environment...
  await Promise.all([
    createTable(ctx, DeckSchema),
    createTable(ctx, SlideSchema),
    createTable(ctx, ComponentSchema),
  ]);
});

test("explore", async () => {
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

  const deck = commit(ctx, [deckCs, slideCs, componentCs], {
    persistNow: true,
  }).nodes.get(deckCs._id);

  await tailer.pendingWrites;

  // now test out the query layer...
  const reloaded = await Deck.read(ctx, deckCs._id);

  // and again with the cache nuked
  cache.clear();
  const reloaded2 = await Deck.read(ctx, deckCs._id);
});

afterAll(() => cache.destroy());
