import { Viewer } from "./viewer";
import { DBResolver } from "./storage/DBResolver";
import { printResolver } from "./storage/DebugResolvers";

export type Context = {
  readonly viewer: Viewer;
  readonly dbResolver: DBResolver;
  // cache
  // default logs
  // svc registry?
  // storage resolver?
};

export default function context(
  viewer: Viewer,
  dbResolver: DBResolver
): Context {
  return {
    viewer,
    dbResolver,
  };
}

export function debugContext(viewer: Viewer): Context {
  return context(viewer, printResolver);
}

export function newFrom(
  oldContext: Context,
  newValues: Partial<Context>
): Context {
  return {
    ...oldContext,
    ...newValues,
  };
}
