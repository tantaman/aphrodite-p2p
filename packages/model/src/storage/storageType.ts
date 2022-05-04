export type Engine = "dexie" | "sqlite";
export type StorageType = "sql"; //  | "dexie";

export default function storageType(engine: Engine): StorageType {
  switch (engine) {
    case "dexie":
      throw new Error("Dexie Not yet supported");
    case "sqlite":
      return "sql";
  }
}

export function maybeStorageType(engine?: Engine) {
  if (engine == null) {
    return null;
  }

  return storageType(engine);
}
