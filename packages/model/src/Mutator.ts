import {
  Changeset,
  CreateChangeset,
  DeleteChangeset,
  UpdateChangeset,
} from "Changeset";
import {
  NodeDefinition,
  NodeInstanceType,
  NodeInternalDataType,
  NodeSchema,
  NodeSchemaEdges,
} from "Schema";

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
  E extends NodeSchemaEdges
> {
  toChangeset(): Changeset<N, E>;
}

abstract class CreateOrUpdateMutationBuilder<
  N extends NodeSchema,
  E extends NodeSchemaEdges
> implements MutationBuilder<N, E>
{
  // ToChangeset would need to figure out how to handle
  // replicated strings...
  // as in diff them and then apply the yjs ops.
  // I guess that is something that's handled at the commit phase
  // in the changeset executor.
  protected updates: Partial<NodeInternalDataType<N>>;
  constructor() {}

  set(newData: Partial<NodeInternalDataType<N>>): this {
    this.updates = {
      ...this.updates,
      ...newData,
    };

    return this;
  }

  abstract toChangeset(): UpdateChangeset<N, E> | CreateChangeset<N, E>;
}

export class UpdateMutationBuilder<
  N extends NodeSchema,
  E extends NodeSchemaEdges
> extends CreateOrUpdateMutationBuilder<N, E> {
  // TODO: might need edge information...
  // esp if we allow updating non field edges from here.

  constructor(private readonly node: NodeInstanceType<N, E>) {
    super();
  }

  toChangeset(): UpdateChangeset<N, E> {
    return {
      type: "update",
      updates: this.updates,
      node: this.node,
    };
  }
}

export class CreateMutationBuilder<
  N extends NodeSchema,
  E extends NodeSchemaEdges
> extends CreateOrUpdateMutationBuilder<N, E> {
  constructor(private readonly definition: NodeDefinition<N, E>) {
    super();
  }

  toChangeset(): CreateChangeset<N, E> {
    return {
      type: "create",
      updates: this.updates,
      definition: this.definition,
    };
  }
}

// You should prob have a ref to the model...
// To destroy it.
export class DeleteMutationBuilder<
  N extends NodeSchema,
  E extends NodeSchemaEdges
> implements MutationBuilder<N, E>
{
  constructor(private node: NodeInstanceType<N, E>) {}

  toChangeset(): DeleteChangeset<N, E> {
    return {
      type: "delete",
      node: this.node,
    };
  }
}

// Need node definition to:
// Creates: create from data
// Updates: ?
// Deletes: ?