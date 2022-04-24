import {
  NodeDefinition,
  NodeInstanceType,
  NodeInternalDataType,
  NodeSchema,
  NodeSchemaEdges,
  RequiredNodeData,
} from "Schema";
import { Node } from "./Node";

export type Changeset<N extends NodeSchema, E extends NodeSchemaEdges> =
  | DeleteChangeset<N, E>
  | UpdateChangeset<N, E>
  | CreateChangeset<N, E>;

/*
How will our text updates work? They wouldn't be modeled in a changeset??
Or would they?
*/

// export type CreateChangeset<N extends NodeSchema, E extends NodeSchemaEdges> = {
//   type: "create";
//   updates: Partial<NodeInternalDataType<N>>;
//   spec: NodeDefinition<N, E>;
// };

export type CreateChangeset<N extends NodeSchema, E extends NodeSchemaEdges> = {
  type: "create";
  updates: Partial<NodeInternalDataType<N>>;
  definition: NodeDefinition<N, E>;
};

export type UpdateChangeset<N extends NodeSchema, E extends NodeSchemaEdges> = {
  type: "update";
  updates: Partial<NodeInternalDataType<N>>;
  node: NodeInstanceType<N, E>;
};

export type DeleteChangeset<N extends NodeSchema, E extends NodeSchemaEdges> = {
  type: "delete";
  node: NodeInstanceType<N, E>;
};

// export function updateChangeset<M extends IModel<D>, D>(
//   updates: D,
// ): Changeset<M, D> {
//   return {
//     type: "update",
//     updates,
//     options,
//   };
// }

// export function createChangeset<M extends IModel<D>, D>(
//   updates: D,
// ): CreateChangeset<M, D> {
//   return {
//     type: "create",
//     updates,
//     options,
//   };
// }

// export function deleteChangeset<M extends IModel<D>, D>(
//   model: M,
// ): DeleteChangeset<M, D> {
//   return {
//     type: "delete",
//     model,
//     options,
//   };
// }
