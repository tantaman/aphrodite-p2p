import { ID_of } from "./ID";
import { Doc } from "./Node";
import { Root } from "./root";
import { Viewer } from "./viewer";
import * as Y from "yjs";

type DocProvider = (parent: ID_of<Doc<any>> | null) => Y.Doc;

export type Context = {
  readonly viewer: Viewer;
  readonly root: Root;
  readonly doc: DocProvider;
  // cache
  // default logs
  // svc registry?
  // storage resolver?
};

export default function context(viewer: Viewer, root: Root): Context {
  return {
    viewer,
    root,
    doc: (parent) => {
      if (parent == null) {
        return root.doc;
      }

      const subDocs = root.subDocs;
      let subDoc = subDocs.get(parent);
      if (subDoc == null) {
        subDoc = new Y.Doc();
        subDocs.set(parent, subDoc);
      }

      return subDoc;
    },
  };
}
