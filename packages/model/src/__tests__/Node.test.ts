jest.useFakeTimers();
import {
  DefineNode,
  numberField,
  replicatedStringField,
  stringField,
} from "../Schema";
import createContext from "../context";
import { viewer } from "../viewer";
import root from "../root";
import cache from "../cache";

const SlideDefinition = {
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
    content: replicatedStringField,
  },
} as const;

const DeckDefinition = {
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

const DeckEdges = {
  slides: {
    type: "foreign",
    field: "deckId",
    dest: SlideDefinition,
  },
} as const;

const TestModelDefinition = {
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
    age: numberField,
  },
} as const;
const TestModel = DefineNode(TestModelDefinition, {});

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

it("notifies key specific listeners", () => {
  const deck = Deck.create(context)
    .set({
      name: "foo",
    })
    .save();

  let notified = false;
  deck.subscribeTo(["name"], () => (notified = true));

  expect(notified).toBe(false);

  Deck.update(deck).set({ name: "bar" }).save();
  expect(notified).toBe(false);

  jest.runAllTimers();

  expect(notified).toBe(true);

  expect(deck.name).toEqual("bar");
});

it("does not double notify the same callback, even if registered against many keys", () => {
  const m = TestModel.create(context)
    .set({
      name: "foo",
      age: 2,
    })
    .save();

  let notified = 0;
  m.subscribeTo(["name", "age"], () => (notified += 1));

  expect(notified).toBe(0);

  TestModel.update(m).set({ name: "bar", age: 3 }).save();
  jest.runAllTimers();

  // INTENTIONAL!
  expect(notified).toBe(1);
});

it("does not notify if nothing actually changed", () => {
  const m = TestModel.create(context)
    .set({
      name: "foo",
      age: 2,
    })
    .save();

  let notified = false;
  m.subscribeTo(["name"], () => (notified = true));

  expect(notified).toBe(false);

  TestModel.update(m).set({ name: "foo", age: 2 }).save();
  jest.runAllTimers();

  expect(notified).toBe(false);
});

it("only notifies specific listener if their specific key changed", () => {
  const m = TestModel.create(context)
    .set({
      name: "foo",
      age: 2,
    })
    .save();

  let notified = false;
  m.subscribeTo(["name"], () => (notified = true));

  expect(notified).toBe(false);

  TestModel.update(m).set({ age: 3 }).save();

  jest.runAllTimers();

  expect(notified).toBe(false);
});

it("notifies global listeners", () => {
  const m = TestModel.create(context)
    .set({
      name: "foo",
      age: 2,
    })
    .save();

  let notified = false;
  m.subscribe(() => (notified = true));

  expect(notified).toBe(false);

  TestModel.update(m).set({ age: 3 }).save();
  jest.runAllTimers();

  expect(notified).toBe(true);
});

it("diposes normal listers", () => {
  const m = TestModel.create(context)
    .set({
      name: "foo",
      age: 2,
    })
    .save();

  let notified = false;
  const disposer = m.subscribe(() => (notified = true));

  expect(notified).toBe(false);
  disposer();

  TestModel.update(m).set({ age: 3 }).save();
  jest.runAllTimers();
  expect(notified).toBe(false);
});

it("disposes keyed listeners", () => {
  const m = TestModel.create(context)
    .set({
      name: "foo",
      age: 2,
    })
    .save();

  let notified = false;
  const dispoer = m.subscribeTo(["age"], () => (notified = true));

  expect(notified).toBe(false);
  dispoer();

  TestModel.update(m).set({ age: 3 }).save();
  jest.runAllTimers();
  expect(notified).toBe(false);
});

it("Collapses notifications", () => {
  const m = TestModel.create(context)
    .set({
      name: "foo",
      age: 2,
    })
    .save();

  let notified = 0;
  m.subscribeTo(["age", "name"], () => (notified += 1));

  expect(notified).toBe(0);

  TestModel.update(m)
    .set({
      age: 3,
      name: "bar",
    })
    .save();
  jest.runAllTimers();

  expect(notified).toBe(1);
});

afterAll(() => {
  cache.destroy();
  jest.clearAllTimers();
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
