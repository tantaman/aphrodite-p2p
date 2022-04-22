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

type Edge = FieldEdge | ForeignKeyEdge;
type FieldEdge = {
  type: 'field';
  field: string; // Can we assert that this field exists on current schema?
  dest: any; // <-- schema, once we have types worked out
};
type ForeignKeyEdge = {
  type: 'foreign';
  field: string; // Can we assert that this field exists on source?
  source: any; // <-- schema.. once we have types worked out
};

export type NodeSchema = {
  storage: {
    replicated: boolean;
    persisted: boolean;
  };
  fields: {
    [key: string]: SchemaFieldType;
  };
  edges: {
    [key: string]: 
  }
};

type NodeInstanceType<T extends NodeSchema> = {
  readonly [key in keyof T["fields"]]: T["fields"][key];
};

// And can we map the type to generate a typed instance...
// e.g., queryEdge
// getField
export function DefineNode<T extends NodeSchema>(def: T): NodeInstanceType<T> {}
