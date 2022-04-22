// Schema can require that the thing states it relationship to parent doc
// 1. Root
// 2. ID_of<Doc subclass>

export type SchemaFieldType =
  | "string"
  | "replicatedString"
  | "number"
  | "boolean"
  | "array"
  | "id"
  | "object"
  | "set"
  | "map";

type Edge<TDest extends NodeSchema> = FieldEdge<TDest> | ForeignKeyEdge<TDest>;
type FieldEdge<TDest extends NodeSchema> = {
  type: "field";
  field: string; // Can we assert that this field exists on current schema?
  dest: TDest;
};
type ForeignKeyEdge<TDest extends NodeSchema> = {
  type: "foreign";
  field: string; // Can we assert that this field exists on source?
  dest: TDest; // <-- schema.. once we have types worked out
};

export type NodeSchema = {
  storage: {
    replicated: boolean;
    persisted: boolean;
  };
  fields: {
    [key: string]: SchemaFieldType;
  };
};

export type NodeSchemaEdges = {
  [key: string]: Edge<NodeSchema>;
};

type Querify<T extends string> = `query${Capitalize<T>}`;

type NodeInstanceType<T extends NodeSchema> = {
  readonly [key in keyof T["fields"]]: T["fields"][key];
} & {
  readonly [key in keyof T["edges"] as Querify<
    key extends string ? key : never
  >]: string; //QueryInstanceType<T["edges"][key]>;
};

// And can we map the type to generate a typed instance...
// e.g., queryEdge
// getField
export function DefineNode<T extends NodeSchema, E extends NodeSchemaEdges>(
  def: T,
  edges: E
): NodeInstanceType<T> {}
