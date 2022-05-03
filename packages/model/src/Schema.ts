// Schema can require that the thing states it relationship to parent doc
// 1. Root
// 2. ID_of<Doc subclass>

import {
  CreateMutationBuilder,
  DeleteMutationBuilder,
  UpdateMutationBuilder,
} from "./Mutator";
import { Context } from "./context";
import { ID_of } from "./ID";
import { Doc, Node, NodeBase } from "./Node";
import nodeStorage from "nodeStorage";

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
export function idField<T>(): ID_of<T> {
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
// export function enumField<T>(): T {
//   throw new Error();
// }

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
type JunctionEdge<TSrc extends NodeSchema, TDest extends NodeSchema> = {
  type: "junction";
  src: TSrc;
  dest: TDest;
  bidirectional: boolean;
};

export type PersistConfig = {
  engine: "dexie" | "sqlite";
  db: string;
  tablish: string;
};

export type NodeSchema = {
  storage: {
    replicated: boolean;
    persisted?: PersistConfig;
  };
  fields: () => {
    [key: string]: SchemaFieldType;
  };
};

export type NodeEdgesSchema = {
  [key: string]: Edge<NodeSchema>;
};

type Querify<T extends string> = `query${Capitalize<T>}`;
type Filterify<T extends string> = `where${Capitalize<T>}`;

export type NodeInstanceType<
  T extends NodeSchema,
  E extends NodeEdgesSchema
> = {
  readonly [key in keyof ReturnType<T["fields"]>]: ReturnType<
    ReturnType<T["fields"]>[key]
  >;
} & {
  readonly [key in keyof E as Querify<
    key extends string ? key : never
  >]: () => QueryInstanceType<E[key]["dest"], NodeInstanceType<T, E>>;
} & Node<NodeInternalDataType<T>>;

type QueryInstanceType<
  T extends NodeSchema,
  N extends NodeInstanceType<any, any>
> = {
  readonly [key in keyof ReturnType<T["fields"]> as Filterify<
    key extends string ? key : never
  >]: () => QueryInstanceType<T, N>;
} & Query<N>;

export type RequiredNodeData = {
  readonly _id: ID_of<any>;
  readonly _parentDocId: ID_of<Doc<any>> | null;
};

export type NodeInternalDataType<T extends NodeSchema> = {
  readonly [key in keyof ReturnType<T["fields"]>]: ReturnType<
    ReturnType<T["fields"]>[key]
  >;
} & RequiredNodeData;

interface Query<T> {
  gen(): Promise<T[]>;
}

export type NodeDefinition<N extends NodeSchema, E extends NodeEdgesSchema> = {
  schema: {
    node: N;
    edges: E;
  };
  _createFromData: (
    context: Context,
    data: NodeInternalDataType<N>
  ) => NodeInstanceType<N, E>;
  create(context: Context): CreateMutationBuilder<N, E>;
  read(
    context: Context,
    id: ID_of<NodeInstanceType<N, E>>
  ): Promise<NodeInstanceType<N, E>>;
  update(node: NodeInstanceType<N, E>): UpdateMutationBuilder<N, E>;
  delete(node: NodeInstanceType<N, E>): DeleteMutationBuilder<N, E>;
};

// And can we map the type to generate a typed instance...
// e.g., queryEdge
// getField
export function DefineNode<N extends NodeSchema, E extends NodeEdgesSchema>(
  node: N,
  edges: E
): NodeDefinition<N, E> {
  let definition: NodeDefinition<N, E>;
  class ConcreteNode extends NodeBase<NodeInternalDataType<N>> {
    readonly _definition = definition;
  }

  Object.entries(node.fields).forEach(([key, value]) => {
    Object.defineProperty(ConcreteNode.prototype, key, {
      get() {
        return this._data[key];
      },
    });
  });

  definition = {
    schema: {
      node,
      edges,
    },

    create(context: Context): CreateMutationBuilder<N, E> {
      return new CreateMutationBuilder(context, definition);
    },

    async read(
      context: Context,
      id: ID_of<NodeInstanceType<N, E>>
    ): Promise<NodeInstanceType<N, E>> {
      return await nodeStorage.readOne(context, definition, id);
    },

    // queryAll ?

    update(node: NodeInstanceType<N, E>): UpdateMutationBuilder<N, E> {
      return new UpdateMutationBuilder(node);
    },

    delete(node: NodeInstanceType<N, E>): DeleteMutationBuilder<N, E> {
      return new DeleteMutationBuilder(node);
    },

    // @ts-ignore
    _createFromData: (context: Context, data) => {
      return new ConcreteNode(context, data);
    },
  };

  return definition;
}
