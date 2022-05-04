import { Engine, StorageType } from "./storageType";

export interface DBResolver {
  type<T extends StorageType>(type: T): TypedDBResolver<T>;
}

export interface TypedDBResolver<T extends StorageType> {
  // TODO: we can scope engines based on type T
  engine(engine: Engine): SpecificTypedDBResolver<T>;
}

export interface SpecificTypedDBResolver<T extends StorageType> {
  db(db: string): DBTypes[T];
}

// TODO: the client should be able to configure what db types they'd like to supply
// resolvers for
type DBTypes = {
  sql: SQLDBAdaptor;
};

export interface SQLDBAdaptor {
  // TODO: can we get better types here?
  // From ModelSpec<T> and the projection of the query?
  // if the projection is known and the spec is known we know what the query returns.
  exec(queryString: string, bindings: readonly any[]): Promise<any>;
}
