import { ID_of } from "../ID";
import { Doc } from "../Node";
import {
  NodeDefinition,
  NodeInstanceType,
  NodeInternalDataType,
  NodeSchema,
} from "../Schema";

export type Changeset<N extends NodeSchema> =
  | DeleteChangeset<N>
  | UpdateChangeset<N>
  | CreateChangeset<N>;

export type CreateChangeset<N extends NodeSchema> = {
  type: "create";
  _id: ID_of<NodeInstanceType<N>>;
  _parentDocId: ID_of<Doc<any>> | null;
  updates: Partial<NodeInternalDataType<N>>;
  definition: NodeDefinition<N>;
};

export type UpdateChangeset<N extends NodeSchema> = {
  type: "update";
  _id: ID_of<NodeInstanceType<N>>;
  _parentDocId: ID_of<Doc<any>> | null;
  updates: Partial<NodeInternalDataType<N>>;
  node: NodeInstanceType<N>;
};

export type DeleteChangeset<N extends NodeSchema> = {
  type: "delete";
  _id: ID_of<NodeInstanceType<N>>;
  _parentDocId: ID_of<Doc<any>> | null;
  node: NodeInstanceType<N>;
};
