import * as Y from "yjs";

export type Root = {
  readonly doc: Y.Doc;
  readonly subDocs: Y.Map<Y.Doc>;
};

export default function root(): Root {
  const doc = new Y.Doc();
  const subDocs = doc.getMap<Y.Doc>();
  return { doc, subDocs };
}
