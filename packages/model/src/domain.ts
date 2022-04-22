import * as Y from "yjs";
type Doc = Y.Doc;

export type Domain = {
  readonly name: string;
  readonly doc: Doc;
};

export default function domain(name: string): Domain {
  const doc = new Y.Doc();
  return { name, doc };
}
