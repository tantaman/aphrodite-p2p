import { RequiredNodeData } from "../Schema";
import { Node } from "../Node";
import { ChunkIterable, SyncMappedChunkIterable } from "./ChunkIterable";
import { DerivedExpression } from "./Expression";
import { Context } from "../context";

export default class ModelLoadExpression<
  TData extends RequiredNodeData,
  TModel extends Node<TData>
> implements DerivedExpression<TData, TModel>
{
  readonly type = "modelLoad";
  constructor(
    private context: Context,
    private factory: (context: Context, data: TData) => TModel
  ) {}

  chainAfter(iterable: ChunkIterable<TData>) {
    return new SyncMappedChunkIterable(iterable, (data) =>
      this.factory(this.context, data)
    );
  }
}
