import * as Y from "yjs";

export type Domain = {
  readonly name: string;
  readonly doc: Y.Doc;
  readonly subDocs: Y.Map<Y.Doc>;
};

export default function domain(name: string): Domain {
  const doc = new Y.Doc();
  const subDocs = doc.getMap<Y.Doc>();
  return { name, doc, subDocs };
}
