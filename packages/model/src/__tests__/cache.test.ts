import { id } from "../ID";
import cache from "../cache";
import { DefineNode, stringField } from "Schema";
import context from "context";
import { viewer } from "viewer";
import root from "root";

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

const ctx = context(viewer(id("me")), root());
const Deck = DefineNode(DeckDefinition, DeckEdges);
const node = Deck.create(ctx).set({ name: "Deck" }).toChangeset();

// oh.. how do we save a nod :p

// test("The cache lets me set things", () => {
//   cache.set(id("sdf"), node);
// });
// test("The cahce lets me get things", () => {});
// test("The cache evicts things", () => {});
