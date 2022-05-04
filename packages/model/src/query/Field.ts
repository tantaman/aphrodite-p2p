import { RequiredNodeData } from "../Schema";
import { Node } from "../Node";

export interface FieldGetter<Tm, Tv> {
  readonly get: (Tm) => Tv;
}

export class ModelFieldGetter<
  Tk extends keyof Td,
  Td extends RequiredNodeData,
  Tm extends Node<Td>
> implements FieldGetter<Tm, Td[Tk]>
{
  constructor(public readonly fieldName: Tk) {}

  get(model: Tm): Td[Tk] {
    // TODO: go thru actual methods rather than `_get`?
    return model._get(this.fieldName);
  }
}
