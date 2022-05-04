import { Viewer } from "./viewer";
import { DBResolver } from "./storage/DBResolver";
import { printResolver } from "./storage/Resolvers";
import TransactionLog from "./TransactionLog";

export type Context = {
  readonly viewer: Viewer;
  readonly dbResolver: DBResolver;
  readonly replicationLog: TransactionLog;
  readonly persistLog: TransactionLog;
};

const defaultReplicationLog = new TransactionLog(50);
const defaultPersistLog = new TransactionLog(50);

export default function context(
  viewer: Viewer,
  dbResolver: DBResolver,
  replicationLog: TransactionLog = defaultReplicationLog,
  persistLog: TransactionLog = defaultPersistLog
): Context {
  return {
    viewer,
    dbResolver,
    replicationLog,
    persistLog,
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
