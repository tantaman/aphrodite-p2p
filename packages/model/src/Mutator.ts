import {
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

abstract class CreateOrUpdateMutationBuilder {
  // ToChangeset would need to figure out how to handle
  // replicated strings...
  // as in diff them and then apply the yjs ops.
  // I guess that is something that's handled at the commit phase
  // in the changeset executor.
}

export class UpdateMutationBuilder<N extends NodeSchema> {
  // TODO: might need edge information...
  // esp if we allow updating non field edges from here.

  private updates: Partial<NodeInternalDataType<N>>;
  constructor(private data: NodeInternalDataType<N>) {
    this.updates = {};
  }

  set(newData: Partial<NodeInternalDataType<N>>): this {
    this.data = {
      ...this.data,
      ...newData,
    };

    return this;
  }
}

export class DeleteMutationBuilder {}

// Need node definition to:
// Creates: create from data
// Updates: ?
// Deletes: ?
