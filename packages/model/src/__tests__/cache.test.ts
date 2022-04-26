import { id, ID_of } from "../ID";
import cache from "../cache";
import { RequiredNodeData } from "../Schema";
import { Doc, Node } from "../Node";
import { Context } from "context";

class TestNode implements Node<RequiredNodeData> {
  readonly _id: ID_of<this>;
  readonly _parentDocId: ID_of<Doc<any>> | null;

  constructor(id: ID_of<any>) {
    this._id = id;
    this._parentDocId = null;
  }

  _destroy(): void {}
  _merge(
    newData: Partial<RequiredNodeData>
  ): [Partial<RequiredNodeData>, Set<() => void>] {
    throw new Error();
  }
  get _context(): Context {
    throw new Error();
  }
  subscribe(c: () => void): () => void {
    return () => {};
  }
  subscribeTo(keys: (keyof RequiredNodeData)[], c: () => void): () => void {
    return () => {};
  }
  _isNoop(updates: Partial<RequiredNodeData>): boolean {
    return false;
  }
}

test("The cache lets me set things", () => {
  const myId = id<TestNode>("sdf");
  expect(() => cache.set(myId, new TestNode(myId))).not.toThrow();
});

test("The cache lets me get things", () => {
  const theId = id<TestNode>("xdf");
  const toSet = new TestNode(theId);
  cache.set(theId, toSet);
  const gotten = cache.get(theId);
  expect(toSet).toBe(gotten);
});

// test("The cache evicts things", () => {
//   cache.set(id<TestNode>("unreferenced"), new TestNode());
//   jest.runAllTimers();
//   expect(cache.get(id<TestNode>("unreferenced"))).toBe(null);
// });

test("The cache lets me remove things", () => {
  const theId = id<TestNode>("aff");
  const node = new TestNode(theId);
  cache.set(theId, node);
  const removed = cache.remove(theId);
  expect(node).toBe(removed);
  expect(cache.get(theId)).toBeNull();
});

afterAll(() => {
  cache.destroy();
});
