import root from "../root";

test("root creation", () => {
  const r = root();
  expect(r.doc).toBeTruthy();
  expect(r.subDocs.size).toEqual(0);
});
