import { id } from "../ID";
import cache from "../cache";
import { DefineNode, RequiredNodeData, stringField } from "../Schema";
import context from "../context";
import { viewer } from "../viewer";
import root from "../root";
import { Node } from "../Node";

class TestNode implements Node<RequiredNodeData> {
  _destroy(): void {}
}
test("The cache lets me set things", () => {
  expect(() => cache.set(id<TestNode>("sdf"), new TestNode())).not.toThrow();
});
test("The cahce lets me get things", () => {
  const toSet = new TestNode();
  cache.set(id<TestNode>("xdf"), toSet);
  const gotten = cache.get(id<TestNode>("xdf"));
  expect(toSet).toBe(gotten);
});
test("The cache evicts things", () => {});
test("The cache lets me remove things", () => {});
