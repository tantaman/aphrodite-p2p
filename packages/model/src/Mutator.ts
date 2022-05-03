import { Context } from "./context";
import { nanoid } from "nanoid";
import {
  Changeset,
  CreateChangeset,
  DeleteChangeset,
  UpdateChangeset,
} from "./Changeset";
import {
  NodeDefinition,
  NodeInstanceType,
  NodeInternalDataType,
  NodeSchema,
  NodeEdgesSchema,
  RequiredNodeData,
} from "./Schema";
import { ChangesetExecutor } from "./ChangesetExecutor";
import { id, ID_of } from "./ID";

// Validation should be applied in mutators?
// Well field level validation, yes
// Object level validation, no
// Object level is as an observer almost. Gets applied once changesets are built
// and before they execute

// A non-repliacated type
// would change the behavior of the changeset executor.
// the executor would just directly update the model rather than
// updating y.

// a non-persisted type would have its events ignored in the
// log tailer of persistence.

export interface MutationBuilder<
  N extends NodeSchema,
  E extends NodeEdgesSchema
> {
  toChangeset(): Changeset<N, E>;
}

abstract class CreateOrUpdateMutationBuilder<
  N extends NodeSchema,
  E extends NodeEdgesSchema
> implements MutationBuilder<N, E>
{
  // ToChangeset would need to figure out how to handle
  // replicated strings...
  // as in diff them and then apply the yjs ops.
  // I guess that is something that's handled at the commit phase
  // in the changeset executor.
  protected updates: Partial<NodeInternalDataType<N>>;
  constructor(protected readonly context: Context) {}

  set(
    newData: Partial<Omit<NodeInternalDataType<N>, keyof RequiredNodeData>>
  ): this {
    this.updates = {
      ...this.updates,
      ...newData,
    };

    return this;
  }

  abstract toChangeset(): UpdateChangeset<N, E> | CreateChangeset<N, E>;

  save(): NodeInstanceType<N, E> {
    const cs = this.toChangeset();
    const tx = new ChangesetExecutor(this.context, [cs]).execute();
    return tx.nodes.get(cs._id) as NodeInstanceType<N, E>;
  }
}

export class UpdateMutationBuilder<
  N extends NodeSchema,
  E extends NodeEdgesSchema
> extends CreateOrUpdateMutationBuilder<N, E> {
  // TODO: might need edge information...
  // esp if we allow updating non field edges from here.

  constructor(private readonly node: NodeInstanceType<N, E>) {
    super(node._context);
  }

  toChangeset(): UpdateChangeset<N, E> {
    return {
      type: "update",
      updates: this.updates,
      node: this.node,
      _id: this.node._id,
      _parentDocId: this.node._parentDocId,
    };
  }
}

export class CreateMutationBuilder<
  N extends NodeSchema,
  E extends NodeEdgesSchema
> extends CreateOrUpdateMutationBuilder<N, E> {
  constructor(
    context: Context,
    private readonly definition: NodeDefinition<N, E>
  ) {
    super(context);
  }

  toChangeset(): CreateChangeset<N, E> {
    const _id = id(nanoid());
    return {
      type: "create",
      updates: {
        ...this.updates,
        _id,
      },
      definition: this.definition,
      _id: _id as ID_of<NodeInstanceType<N, E>>,
      // TODO: make user set parent? fatal on lack of parent?
      // TODO: run whole object validation rules here?
      _parentDocId: null,
    };
  }
}

// You should prob have a ref to the model...
// To destroy it.
export class DeleteMutationBuilder<
  N extends NodeSchema,
  E extends NodeEdgesSchema
> implements MutationBuilder<N, E>
{
  constructor(private node: NodeInstanceType<N, E>) {}

  toChangeset(): DeleteChangeset<N, E> {
    return {
      type: "delete",
      node: this.node,
      _id: this.node._id,
      _parentDocId: this.node._parentDocId,
    };
  }
}

// Need node definition to:
// Creates: create from data
// Updates: ?
// Deletes: ?
