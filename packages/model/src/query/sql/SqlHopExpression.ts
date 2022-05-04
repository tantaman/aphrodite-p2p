import { ID_of } from "../../ID.js";
import { NodeDefinition, NodeInstanceType, NodeSchema } from "../../Schema.js";
import { ChunkIterable } from "../ChunkIterable.js";
import { HopExpression } from "../Expression.js";
import HopPlan from "../HopPlan.js";
import { HoistedOperations } from "./SqlSourceExpression.js";

export default class SQLHopExpression<T>
  implements HopExpression<ID_of<NodeInstanceType<NodeSchema>>, T>
{
  readonly spec: NodeDefinition<NodeSchema>;
  readonly ops: HoistedOperations;

  chainAfter(iterable: ChunkIterable<ID_of<any>>): ChunkIterable<T> {
    throw new Error("unimplemented");
  }
  /**
   * Optimizes the current plan (plan) and folds in the nxet hop (nextHop) if possible.
   */
  optimize(plan: HopPlan, nextHop?: HopPlan): HopPlan {
    throw new Error("unimplemented");
  }

  type: "hop" = "hop";
}
