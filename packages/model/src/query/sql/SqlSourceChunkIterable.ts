import { BaseChunkIterable } from "../ChunkIterable.js";
import specAndOpsToSQL from "../../storage/sql/specAndOpsToSql.js";
import { HoistedOperations } from "./SqlSourceExpression.js";
import { invariant, nullthrows } from "@strut/utils";
import { NodeDefinition, NodeSchema } from "Schema.js";
import storageType, { maybeStorageType } from "../../storage/storageType.js";
import { Context } from "../../context";

export default class SQLSourceChunkIterable<T> extends BaseChunkIterable<T> {
  private cachedCompilation: ReturnType<typeof compile> | null;
  constructor(
    private context: Context,
    private spec: NodeDefinition<NodeSchema>,
    private hoistedOperations: HoistedOperations
  ) {
    super();
    invariant(
      maybeStorageType(this.spec.schema.storage.persisted?.engine) === "sql",
      "SQL source used for non-SQL model!"
    );
  }

  async *[Symbol.asyncIterator](): AsyncIterator<readonly T[]> {
    const query = this.compileQuery();
    const persisted = nullthrows(this.spec.schema.storage.persisted);

    // TODO: stronger types one day
    // e.g., exec should be parametrized and checked against T somehow.
    // Should probably allow a namespace too?
    // also... this is pretty generic and would apply to non-sql data sources too.
    // given the actual query execution happens in the resolver.
    // also -- should we chunk it at all?
    return await this.context.dbResolver
      .type(storageType(persisted.engine))
      .engine(persisted.engine)
      .db(persisted.db)
      .exec(query.sql, query.bindings);
  }

  private compileQuery() {
    if (this.cachedCompilation != null) {
      return this.cachedCompilation;
    }

    this.cachedCompilation = compile(this.spec, this.hoistedOperations);
    return this.cachedCompilation;
  }
}

// This is the only SQL specific bit.
// well.. the hoisted ops would differ by backend too.
function compile(
  spec: NodeDefinition<NodeSchema>,
  hoistedOperations: HoistedOperations
) {
  // TODO Nit: -- slight problem in that the sql generated here is knex format not native format
  // so it'd require the users to use knex.
  // we should get it to native...
  return specAndOpsToSQL(spec, hoistedOperations).toSQL();
}
