import { ID_of } from "./ID";

export type Viewer = {
  readonly id: ID_of<Viewer>;
};

export function viewer(id: ID_of<Viewer>) {
  return {
    id,
  };
}
