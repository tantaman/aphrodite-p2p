import { RequiredNodeData } from "../Schema";
import { Node } from "../Node";
import { ChunkIterable, SyncMappedChunkIterable } from "./ChunkIterable";
import { DerivedExpression } from "./Expression";

export default class ModelLoadExpression<
  TData extends RequiredNodeData,
  TModel extends Node<TData>
> implements DerivedExpression<TData, TModel>
{
  readonly type = "modelLoad";
  constructor(private factory: (TData) => TModel) {}

  chainAfter(iterable: ChunkIterable<TData>) {
    return new SyncMappedChunkIterable(iterable, this.factory);
  }
}
