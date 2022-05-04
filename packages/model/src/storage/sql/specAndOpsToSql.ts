import { HoistedOperations } from "../../query/sql/SqlSourceExpression.js";
// TODO: probably remove dependency on knex
import knex, { Knex } from "knex";
import {
  after,
  before,
  filter,
  orderBy,
  take,
} from "../../query/Expression.js";
import SQLHopExpression from "../../query/sql/SQLHopExpression.js";
import { ModelFieldGetter } from "../../query/Field.js";
import { NodeDefinition, NodeSchema } from "../../Schema.js";
import getKnex from "./getKnexForQueryBuilding.js";

// given a model spec and hoisted operations, return the SQL query
// TODO: maybe remove dependency on knex? Given we already have enough information to correctly
// build the query in the given dialect.
export default function specAndOpsToSQL(
  spec: NodeDefinition<NodeSchema>,
  ops: HoistedOperations
): Knex.QueryBuilder {
  const builder = getKnex(spec);
  let table = builder(spec.schema.storage.persisted?.tablish);

  const [lastSpec, lastWhat] = getLastSpecAndProjection(spec, ops);
  switch (lastWhat) {
    case "count":
      table = table.select(`count(_id)`);
      break;
    case "edges":
      throw new Error("edge projection not yet supported");
    case "ids":
      table = table.select("_id");
      break;
    case "model":
      // TODO: lastSpec.fields.map(t.f).join(",");
      // b/c we select only the fields of the last model.
      table = table.select("*");
      break;
  }

  table = applyFilters(table, ops.filters);
  table = applyBeforeAndAfter(table, ops.before, ops.after);
  table = applyOrderBy(table, ops.orderBy);
  table = applyLimit(table, ops.limit);
  table = applyHops(table, ops.hop);

  return table;
}

function getLastSpecAndProjection(
  spec: NodeDefinition<NodeSchema>,
  ops: HoistedOperations
): [NodeDefinition<NodeSchema>, HoistedOperations["what"]] {
  const hop = ops.hop;
  if (hop == null) {
    return [spec, ops.what];
  }

  return getLastSpecAndProjection(hop.spec, hop.ops);
}

function applyFilters<T extends Knex.QueryBuilder>(
  table: T,
  filters?: readonly ReturnType<typeof filter>[]
): Knex.QueryBuilder {
  if (!filters) {
    return table;
  }
  let first = true;
  return filters.reduce((table, filter) => {
    let type: "none" | "and" = first ? "none" : "and";
    first = false;
    return applyFilter(table, filter, type);
  }, table);
}

function applyFilter<T extends Knex.QueryBuilder>(
  table: T,
  f: ReturnType<typeof filter>,
  type: "none" | "and" | "or"
): Knex.QueryBuilder {
  const getter = f.getter as ModelFieldGetter<any, any, any>;
  let op: string | null = null;
  const predicate = f.predicate;
  switch (predicate.type) {
    case "equal":
      op = "=";
      break;
    case "notEqual":
      op = "<>";
      break;
    case "lessThan":
      op = "<";
      break;
    case "greaterThan":
      op = ">";
      break;
    case "lessThanOrEqual":
      op = "<=";
      break;
    case "greaterThanOrEqual":
      op = ">=";
      break;
    case "in":
      return table.whereIn(getter.fieldName, predicate.value as any);
    case "notIn":
      return table.whereNotIn(getter.fieldName, predicate.value as any);
  }

  return table.where(getter.fieldName, op, f.predicate.value as any);
}

function applyBeforeAndAfter<T extends Knex.QueryBuilder>(
  table: T,
  b?: ReturnType<typeof before>,
  a?: ReturnType<typeof after>
): T {
  // TODO: we should figure this one out... e.g., unrolling the cursors and such.
  // should that concern be here tho?
  // or should we just be at > or < at this level?
  return table;
}

function applyOrderBy<T extends Knex.QueryBuilder>(
  table: T,
  o?: ReturnType<typeof orderBy>
): T {
  return table;
}

function applyLimit<T extends Knex.QueryBuilder>(
  table: T,
  l?: ReturnType<typeof take>
): T {
  return table;
}

function applyHops<T extends Knex.QueryBuilder>(
  table: T,
  hop?: SQLHopExpression<any>
): T {
  return table;
}
