import { invariant } from "@strut/utils";
import { maybeStorageType } from "../../storage/storageType.js";
import { EdgeSchema, NodeSchema } from "../../Schema.js";
import { HopExpression } from "../Expression.js";
import { HopQuery, Query } from "../Query.js";

export default class SQLHopQuery<TIn, TOut> extends HopQuery<TIn, TOut> {
  /*
  A SQL hop query means that the next thing is SQL backed.
  We'll take source and see what the source is to determine what HOP
  expression to construct?
  */
  static create<TIn, TOut>(
    sourceQuery: Query<TIn>,
    source: NodeSchema,
    edge: EdgeSchema<NodeSchema>
  ) {
    // based on source and dest spec, determine the appropriate hop expression
    return new SQLHopQuery(sourceQuery, createExpression(source, edge));
  }
}

function createExpression<TIn, TOut>(
  source: NodeSchema,
  edge: EdgeSchema<NodeSchema>
): HopExpression<TIn, TOut> {
  if (maybeStorageType(source.storage.persisted?.engine) === "sql") {
    invariant(
      maybeStorageType(edge.dest.storage.persisted?.engine) === "sql",
      "SQLHopQuery created for non-sql destination"
    );

    // If we're the same storage on the same DB, we can use a join expression
    if (source.storage.persisted?.db === edge.dest.storage.persisted?.db) {
      return createJoinExpression(edge);
    }
  }

  return createChainedHopExpression(edge);
}

function createJoinExpression<TIn, TOut>(
  edge: EdgeSchema<NodeSchema>
): HopExpression<TIn, TOut> {
  throw new Error("Join not yet supported");
}

function createChainedHopExpression<TIn, TOut>(
  edge: EdgeSchema<NodeSchema>
): HopExpression<TIn, TOut> {
  throw new Error("In memory hop not yet supported");
}
