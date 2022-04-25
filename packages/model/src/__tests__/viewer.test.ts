import { id } from "../ID";
import { viewer } from "../viewer";

test("constructing a viewer", () => {
  const v = viewer(id("sdf"));
  expect(v.id).toEqual("sdf");
});
