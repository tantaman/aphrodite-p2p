import { ID_of } from "ID";
import * as Y from "yjs";

export type FieldType = SimpleField | CompositeField<any>;

type SimpleField = number | string | boolean | ID_of<any> | ConflictFreeText;
export type ConflictFreeMap<T> = Y.Map<T>;
type ConflictFreeArray<T> = Y.Array<T>;
type ConflictFreeText = Y.Text;

// TODO: enforce read-only-ness of these structs?
// Or use Immutablejs versions?
type CompositeField<T extends FieldType> =
  | Map<string | number, T>
  | T[]
  | { [key: string]: T }
  | Set<T>
  | ConflictFreeMap<T>
  | ConflictFreeArray<T>;

export function conflictFreeMap<T>(): ConflictFreeMap<T> {
  return new Y.Map();
}

export function conflictFreeArray<T>(): ConflictFreeArray<T> {
  return new Y.Array();
}

export function conflictFreeText(): ConflictFreeText {
  return new Y.Text();
}
