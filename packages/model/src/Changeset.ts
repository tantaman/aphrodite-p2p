import {
  NodeDefinition,
  NodeInternalDataType,
  NodeSchema,
  NodeSchemaEdges,
} from "Schema";
import { Node } from "./Node";

// export type Changeset<N extends Node<D>, D> =
//   | CreateChangeset<N, D>
//   | UpdateChangeset<N, D>
//   | DeleteChangeset<N, D>;

/*
How will our text updates work? They wouldn't be modeled in a changeset??
Or would they?
*/

// export type CreateChangeset<N extends NodeSchema, E extends NodeSchemaEdges> = {
//   type: "create";
//   updates: Partial<NodeInternalDataType<N>>;
//   spec: NodeDefinition<N, E>;
// };

// export type UpdateChangeset<N extends NodeSchema> = {
//   type: "update";
//   updates: Partial<NodeInternalDataType<N>>;
//   node:
// };

// export type DeleteChangeset<N extends NodeSchema> = {
//   type: "delete";
//   model: M;
// };

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
