import { Root } from "root";
import { Viewer } from "viewer";
import * as Y from "yjs";

type DocProvider = () => Y.Doc;

export type Context = {
  readonly viewer: Viewer;
  readonly root: Root;
  readonly doc: DocProvider;
};

export default function context(
  viewer: Viewer,
  root: Root,
  docProvider?: DocProvider
): Context {
  let doc = docProvider || (() => root.doc);
  return {
    viewer,
    root,
    doc,
  };
}
