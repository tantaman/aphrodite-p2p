import { Context } from "../context.js";
import {
  EdgeSchema,
  NodeDefinition,
  NodeInstanceType,
  NodeSchema,
} from "Schema.js";
import { DerivedQuery, HopQuery, Query } from "./Query.js";
import SQLHopQuery from "./sql/SqlHopQuery.js";
import SQLSourceQuery from "./sql/SqlSourceQuery.js";
import { maybeStorageType } from "../storage/storageType.js";

// Runtime factory so we can swap to `Wire` when running on a client vs
// the native platform.
const factory = {
  createSourceQueryFor<T extends NodeSchema>(
    context: Context,
    spec: NodeDefinition<T>
  ): Query<NodeInstanceType<T>> {
    switch (maybeStorageType(spec.schema.storage.persisted?.engine)) {
      case "sql":
        return new SQLSourceQuery(context, spec);
      default:
        throw new Error(
          spec.schema.storage.persisted?.engine + " is not yet supported"
        );
    }
  },

  // TODO: get types into the edge specs so our hop and have types?
  createHopQueryFor<TDest>(
    priorQuery: DerivedQuery<any>,
    source: NodeSchema,
    // Edge schema might not be enough... unless we save a mapping from schemas to definitions/specs
    edge: EdgeSchema<any>
  ): HopQuery<any, any> {
    // SQLHopQuery and so on
    if (edge.dest.storage.type === "sql") {
      return SQLHopQuery.create(priorQuery, source, edge);
    }

    throw new Error("Unimplemented hop");
  },
};

export default factory;
