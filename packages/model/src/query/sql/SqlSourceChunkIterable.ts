import { BaseChunkIterable } from "../ChunkIterable.js";
import specAndOpsToQuery from "../../storage/sql/specAndOpsToQuery.js";
import { HoistedOperations } from "./SqlSourceExpression.js";
import { invariant, nullthrows } from "@strut/utils";
import { NodeDefinition, NodeSchema } from "Schema.js";
import storageType, { maybeStorageType } from "../../storage/storageType.js";
import { Context } from "../../context";

export default class SQLSourceChunkIterable<T> extends BaseChunkIterable<T> {
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
    const persisted = nullthrows(this.spec.schema.storage.persisted);

    // TODO: stronger types one day
    // e.g., exec should be parametrized and checked against T somehow.
    // Should probably allow a namespace too?
    // also... this is pretty generic and would apply to non-sql data sources too.
    // given the actual query execution happens in the resolver.
    // also -- should we chunk it at all?
    return await specAndOpsToQuery(
      this.spec,
      this.hoistedOperations,
      this.context.dbResolver
        .type(storageType(persisted.engine))
        .engine(persisted.engine)
        .db(persisted.db)
    );
  }
}
