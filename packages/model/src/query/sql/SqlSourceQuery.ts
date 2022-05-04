import { Context } from "../../context.js";
import { NodeDefinition, NodeSchema } from "Schema.js";
import { SourceQuery } from "../Query.js";
import SQLSourceExpression, { SQLResult } from "./SqlSourceExpression.js";

export default class SQLSourceQuery<T> extends SourceQuery<T> {
  constructor(context: Context, spec: NodeDefinition<NodeSchema>) {
    super(new SQLSourceExpression(context, spec, { what: "model" }));
  }
}
