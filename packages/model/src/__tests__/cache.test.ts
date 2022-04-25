import { id } from "../ID";
import cache from "../cache";
import { RequiredNodeData } from "../Schema";
import { Node } from "../Node";
import { Context } from "context";

class TestNode implements Node<RequiredNodeData> {
  _destroy(): void {}
  getContext(): Context {
    throw new Error();
  }
}
test("The cache lets me set things", () => {
  expect(() => cache.set(id<TestNode>("sdf"), new TestNode())).not.toThrow();
});

test("The cache lets me get things", () => {
  const toSet = new TestNode();
  cache.set(id<TestNode>("xdf"), toSet);
  const gotten = cache.get(id<TestNode>("xdf"));
  expect(toSet).toBe(gotten);
});

// test("The cache evicts things", () => {
//   cache.set(id<TestNode>("unreferenced"), new TestNode());
//   jest.runAllTimers();
//   expect(cache.get(id<TestNode>("unreferenced"))).toBe(null);
// });

test("The cache lets me remove things", () => {
  const node = new TestNode();
  cache.set(id<TestNode>("aff"), node);
  const removed = cache.remove(id<TestNode>("aff"));
  expect(node).toBe(removed);
  expect(cache.get(id<TestNode>("aff"))).toBeNull();
});

afterAll(() => {
  cache.destroy();
});
