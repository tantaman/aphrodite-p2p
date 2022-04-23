// Schema can require that the thing states it relationship to parent doc
// 1. Root
// 2. ID_of<Doc subclass>

import { Context } from "./context";
import { ID_of } from "./ID";
import { Doc, ReplicatedNode } from "./Node";

export function stringField(): string {
  throw new Error();
}
export function numberField(): number {
  throw new Error();
}
export function replicatedStringField(): string {
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

export type NodeInternalDataType<T extends NodeSchema> = {
  readonly [key in keyof T["fields"]]: ReturnType<T["fields"][key]>;
} & {
  _id: ID_of<any>;
  _parentDoc: ID_of<Doc<any>> | null;
};

interface Query<T> {
  gen(): Promise<T[]>;
}

export type NodeDefinition<T extends NodeSchema, E extends NodeSchemaEdges> = {
  schema: {
    node: T;
    edges: E;
  };
  createFromData: (
    context: Context,
    data: NodeInternalDataType<T>
  ) => NodeInstanceType<T, E>;
};

// And can we map the type to generate a typed instance...
// e.g., queryEdge
// getField
export function DefineNode<T extends NodeSchema, E extends NodeSchemaEdges>(
  node: T,
  edges: E
): NodeDefinition<T, E> {
  class ConcreteNode extends ReplicatedNode<NodeInternalDataType<T>> {}

  Object.entries(node.fields).forEach(([key, value]) => {
    Object.defineProperty(ConcreteNode.prototype, key, {
      get() {
        return this.data[key];
      },
    });
  });

  return {
    schema: {
      node,
      edges,
    },

    // @ts-ignore
    createFromData: (context: Context, data) => {
      return new ConcreteNode(context, data);
    },
  };
}
