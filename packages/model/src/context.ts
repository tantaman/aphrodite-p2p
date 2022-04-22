import { Domain } from "domain";
import { Viewer } from "viewer";

export type Context = {
  readonly viewer: Viewer;
  readonly domain: Domain;
};

export default function context(viewer: Viewer, domain: Domain): Context {
  return {
    viewer,
    domain,
  };
}
