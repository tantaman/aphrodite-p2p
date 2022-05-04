import { ID_of } from "./ID";
import { Doc } from "./Node";
import { Viewer } from "./viewer";
import { RequiredNodeData } from "./Schema";
import { DBResolver } from "./query/storage/DBResolver";

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

// TODO: gut the default context.
let _defaultContext: Context | null = null;
export function defaultContext(
  viewer: Viewer,
  dbResolver: DBResolver
): Context {
  if (_defaultContext != null) {
    return newFrom(_defaultContext, { viewer });
  }

  _defaultContext = context(viewer, dbResolver);
  return _defaultContext;
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
