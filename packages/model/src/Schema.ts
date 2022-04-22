// Schema can require that the thing states it relationship to parent doc
// 1. Root
// 2. ID_of<Doc subclass>

import { ID_of } from "ID";
import * as Y from "yjs";

export function stringField(): string {
  throw new Error();
}
export function numberField(): number {
  throw new Error();
}
export function replicatedStringField(): Y.Text {
  throw new Error();
}
export function booleanField(): boolean {
  throw new Error();
}
export function arrayField(): readonly any[] {
  throw new Error();
}
export function idField(): ID_of<any> {
  throw new Error();
}
export function objectField(): Object {
  throw new Error();
}
export function setField(): Set<any> {
  throw new Error();
}
export function mapField(): Map<any, any> {
  throw new Error();
}

export type SchemaFieldType =
  | typeof stringField
  | typeof replicatedStringField
  | typeof numberField
  | typeof booleanField
  | typeof arrayField
  | typeof idField
  | typeof objectField
  | typeof setField
  | typeof mapField;

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
type Filterify<T extends string> = `where${Capitalize<T>}`;

type NodeInstanceType<T extends NodeSchema, E extends NodeSchemaEdges> = {
  readonly [key in keyof T["fields"]]: ReturnType<T["fields"][key]>;
} & {
  readonly [key in keyof E as Querify<
    key extends string ? key : never
  >]: () => QueryInstanceType<E[key]["dest"], NodeInstanceType<T, E>>;
};

type QueryInstanceType<
  T extends NodeSchema,
  N extends NodeInstanceType<any, any>
> = {
  readonly [key in keyof T["fields"] as Filterify<
    key extends string ? key : never
  >]: () => QueryInstanceType<T, N>;
} & Query<N>;

type NodeInternalDataType<T extends NodeSchema> = {
  // readonly [key in keyof T["fields"]]:
};

interface Query<T> {
  gen(): Promise<T[]>;
}

// And can we map the type to generate a typed instance...
// e.g., queryEdge
// getField
export function DefineNode<T extends NodeSchema, E extends NodeSchemaEdges>(
  node: T,
  edges: E
): {
  schema: {
    node: T;
    edges: E;
  };
  createFromData: () => NodeInstanceType<T, E>;
} {
  return {
    schema: {
      node,
      edges,
    },
    createFromData: () => {},
  };
}
