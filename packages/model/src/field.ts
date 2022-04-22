import { ID_of } from "ID";

export type FieldType = SimpleField | CompositeField;

type SimpleField = number | string | boolean | ID_of<any> | null;

// TODO: enforce read-only-ness of these structs?
// Or use Immutablejs versions?
type CompositeField =
  | Map<string | number, FieldType>
  | FieldType[]
  | { [key: string]: FieldType }
  | Set<FieldType>;

// export function conflictFreeMap<T>(): ConflictFreeMap<T> {
//   return new Y.Map();
// }

// export function conflictFreeArray<T>(): ConflictFreeArray<T> {
//   return new Y.Array();
// }

// export function conflictFreeText(): ConflictFreeText {
//   return new Y.Text();
// }

/**
 * 1. We read from storage to seed our app
 * 2. We hydrate read in things to Y or other structs
 * 3. Going back to storage, we serialize the current model.
 */
