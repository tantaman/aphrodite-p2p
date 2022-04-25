// Given changesets,
// Either
// 1. Create the nodes
// 2. Update the nodes
// 3. Delete the nodes
// Combo of 1-3
//
// And depending no node definitions...
// -> update via yjs
// -> update node directly
// ^-- the above would happen via the node's merge method(s)
//
// Does a changeset executor do much of anything?
// 1 -> collapse changesets in the batch
// 2 -> call _merge or _create or delete
//
// If yjs has undo/redo capability....
// should we retain that for ourselves too?
// the reason to retain it for ourselves would be to handle
// undo/redo for non-replicated models

import { invariant } from "@aphro/lf-error";
import { Changeset } from "Changeset";
import { ID_of } from "ID";

type MergedChangesets = Map<ID_of<any>, Changeset<any, any>>;

class ChangesetExecutor {
  constructor(private changesets: Changeset<any, any>[]) {}

  execute() {
    // Merge multiple updates to the same object into a single changeset
    const merged = this.mergeChangesets();
  }

  private mergeChangesets(): MergedChangesets {
    const merged: MergedChangesets = new Map();
    for (const changeset of this.changesets) {
      const existing = merged.get(changeset._id);

      if (!existing) {
        merged.set(changeset._id, changeset);
        continue;
      }

      if (existing.type === "delete") {
        // No need to merge. Deleted is deleted.
        continue;
      }

      if (changeset.type === "delete") {
        // Replace the existing one with the delete.
        merged.set(changeset._id, changeset);
        continue;
      }

      if (changeset.type === "create") {
        throw new Error("Creating the same node twice");
      }

      if (existing.type === "create") {
        throw new Error("Updating a nod ebefore it is created");
      }

      merged.set(changeset._id, {
        type: "update",
        updates: {
          ...existing.updates,
          ...changeset.updates,
        },
        node: changeset.node,
        _id: changeset.node._id,
      });
    }

    return merged;
  }

  // Maybe we should also ignore changesets that don't actually change anything?
  // private removeNoops(changesets: MergedChangesets) {
  //   for (const [model, changes] of changesets) {
  //     if (changes !== undefined && model.isNoop(changes)) {
  //       changesets.delete(model);
  //     }
  //   }
  // }
}
