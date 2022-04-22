import { Viewer } from "viewer";
import { Domain } from "domain";

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
