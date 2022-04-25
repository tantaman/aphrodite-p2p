import { UpdateMutationBuilder } from "../Mutator";
import context from "../context";
import { id } from "../ID";
import { ReplicatedNode } from "../Node";
import root from "../root";
import { RequiredNodeData } from "../Schema";
import { viewer } from "../viewer";
import cache from "../cache";

const ctx = context(viewer(id("sdf")), root());
test("basic replicated node", () => {
  class MyNode extends ReplicatedNode<
    {
      name: string;
    } & RequiredNodeData
  > {}

  const node = new MyNode(ctx, {
    _id: id("abc"),
    _parentDocId: null,
    name: "foo",
  });

  // map.set("name", "foo");

  new UpdateMutationBuilder(node as any).set({ name: "bar" }).save();
  // map.set("name", "bar");
  console.log(node._d());
});

afterAll(() => cache.destroy());
