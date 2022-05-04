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
import nodeStorage from "./nodeStorage";
import { upcaseAt } from "@strut/utils";

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

export type EdgeSchema<TDest extends NodeSchema> =
  | FieldEdge<TDest>
  | ForeignKeyEdge<TDest>;
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
  edges: () => {
    [key: string]: EdgeSchema<NodeSchema>;
  };
};

type Querify<T extends string> = `query${Capitalize<T>}`;
type Filterify<T extends string> = `where${Capitalize<T>}`;

type MakeQueryMethods<T extends NodeSchema> = {
  readonly [key in keyof ReturnType<T["edges"]> as Querify<
    key extends string ? key : never
  >]: () => QueryInstanceType<
    ReturnType<T["edges"]>[key]["dest"],
    NodeInstanceType<T>
  >;
};

export type NodeInstanceType<T extends NodeSchema> = {
  readonly [key in keyof ReturnType<T["fields"]>]: ReturnType<
    ReturnType<T["fields"]>[key]
  >;
} & MakeQueryMethods<T> &
  Node<NodeInternalDataType<T>>;

type QueryInstanceType<T extends NodeSchema, N extends NodeInstanceType<T>> = {
  readonly [key in keyof ReturnType<T["fields"]> as Filterify<
    key extends string ? key : never
  >]: () => QueryInstanceType<T, N>;
} & MakeQueryMethods<T> &
  Query<N>;

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

export type NodeDefinition<N extends NodeSchema> = {
  schema: N;
  _createFromData: (
    context: Context,
    data: NodeInternalDataType<N>
  ) => NodeInstanceType<N>;
  // TODO create query / query all
  create(context: Context): CreateMutationBuilder<N>;
  read(
    context: Context,
    id: ID_of<NodeInstanceType<N>>
  ): Promise<NodeInstanceType<N>>;
  update(node: NodeInstanceType<N>): UpdateMutationBuilder<N>;
  delete(node: NodeInstanceType<N>): DeleteMutationBuilder<N>;
};

// And can we map the type to generate a typed instance...
// e.g., queryEdge
// getField
export function DefineNode<N extends NodeSchema>(node: N): NodeDefinition<N> {
  let definition: NodeDefinition<N>;
  class ConcreteNode extends NodeBase<NodeInternalDataType<N>> {
    readonly _definition = definition;
  }

  Object.entries(node.fields()).forEach(([key, value]) => {
    Object.defineProperty(ConcreteNode.prototype, key, {
      get() {
        return this._data[key];
      },
    });
  });

  Object.entries(node.edges()).forEach(([key, value]) => {
    ConcreteNode.prototype[`query${upcaseAt(key, 0)}`] = function () {
      // get correct query type
    };
  });

  // Need to define query methods to return new queries

  // Create the correct source query
  class ConcreteQuery {}

  Object.entries(node.edges()).forEach(([key, value]) => {
    ConcreteQuery.prototype[`query${upcaseAt(key, 0)}`] = function () {
      // hop expression and all that stuff
      // hop expression will be runtime determined
    };
  });

  definition = {
    schema: node,

    create(context: Context): CreateMutationBuilder<N> {
      return new CreateMutationBuilder(context, definition);
    },

    async read(
      context: Context,
      id: ID_of<NodeInstanceType<N>>
    ): Promise<NodeInstanceType<N>> {
      return await nodeStorage.readOne(context, definition, id);
    },

    // queryAll ?

    update(node: NodeInstanceType<N>): UpdateMutationBuilder<N> {
      return new UpdateMutationBuilder(node);
    },

    delete(node: NodeInstanceType<N>): DeleteMutationBuilder<N> {
      return new DeleteMutationBuilder(node);
    },

    // @ts-ignore
    _createFromData: (context: Context, data) => {
      return new ConcreteNode(context, data);
    },
  };

  return definition;
}
