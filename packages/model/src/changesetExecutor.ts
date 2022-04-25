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
// Changesets shouldn't create log events...
// those should come from the merging into the node now since node
// represent stable source of truth after replication reconciliation
//
// If yjs has undo/redo capability....
// should we retain that for ourselves too?
// the reason to retain it for ourselves would be to handle
// undo/redo for non-replicated models

import cache from "./cache";
import { Context } from "context";
import { Changeset, CreateChangeset, UpdateChangeset } from "./Changeset";
import { ID_of } from "./ID";
import { Node } from "./Node";
import * as lodash from "lodash";
import * as y from "yjs";

export type YOrigin = {
  nodes: Node<any>[];
};

export class ChangesetExecutor {
  constructor(
    private context: Context,
    private changesets: Changeset<any, any>[]
  ) {}

  // Ideally we return the transaction list...
  // to replicate to logs.
  execute(): Node<any>[] {
    // Merge multiple updates to the same object into a single changeset
    const merged = this._mergeChangesets();
    // this.removeNoops(merged);
    return this.apply(merged);
  }

  private apply(changesets: Changeset<any, any>[]): Node<any>[] {
    // collect all that use the same doc
    const grouped = lodash.groupBy(changesets, (cs) => cs._parentDocId);
    const origin: YOrigin = {
      nodes: [],
    };
    Object.entries(grouped).forEach(([parentDocId, changesets]) => {
      const doc = this.context.doc(parentDocId as ID_of<any>);
      doc.transact((tx) => {
        changesets.forEach((cs) => {
          const result = this.processChanges(doc, cs);
          if (result != null) {
            tx.origin.nodes.push(result);
          }
        });
      }, origin);
    });

    // Now the real question is how do we get the final transactions out
    // so we can push them onto our log?
    // given y will not notify observers synchronously
    // we need them in the log for persistence concerns.
    return origin.nodes;
  }

  private processChanges(
    doc: y.Doc,
    changeset: Changeset<any, any>
  ): Node<any> | null {
    switch (changeset.type) {
      case "create":
        const ret = changeset.definition._createFromData(
          this.context,
          changeset.updates as any
        );
        cache.set(ret._id, ret);
        ret._update(changeset);
        // this.updateY(doc, changeset);
        return ret;
      case "update":
        changeset.node._update(changeset);
        // this.updateY(doc, changeset);
        return changeset.node;
      case "delete":
        const removed = cache.remove(changeset._id);
        const node = changeset.node || removed;
        node.destory();
        return null;
    }
  }

  // private updateY(
  //   doc: y.Doc,
  //   changeset: CreateChangeset<any, any> | UpdateChangeset<any, any>
  // ) {
  //   console.log(changeset._id);
  //   const ymap = doc.getMap(changeset._id);
  //   console.log(ymap);
  //   // TODO: we need access to the schema to know
  //   // if any of these sub-types are replicated types (e.g., maps)
  //   Object.entries(changeset.updates).forEach(([key, value]) => {
  //     if (key === "_id" || key === "_parentDoc") {
  //       return;
  //     }
  //     console.log(key, value);
  //     ymap.set(key, value);
  //   });
  // }

  _mergeChangesets(): Changeset<any, any>[] {
    const merged: Map<ID_of<any>, Changeset<any, any>> = new Map();
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
        _id: changeset._id,
        _parentDocId: changeset._parentDocId,
      });
    }

    return [...merged.values()];
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

// private apply(changesets: MergedChangesets): [Transaction, Set<Task>] {
//   // iterate changesets
//   // merge into each model
//   // get resulting notifications and prior states from model
//   // return

//   // TODO: we don't need to keep prior states
//   // since the transaction before us is the prior state. Well...
//   // the transaction before us that contains our model!
//   // Hard to find that.
//   const priorStates = new ModelMap<IModel<any>, Partial<any>>();
//   const notifications: Set<Task> = new Set();
//   for (const [model, changes] of changesets) {
//     const mergeResult = model._merge(changes);
//     if (mergeResult == null) {
//       // TODO: we need a test for this merge behavior!
//       // we need tests for all the things!
//       continue;
//     }
//     const [lastData, currentNotifications] = mergeResult;
//     for (const task of currentNotifications) {
//       notifications.add(task);
//     }
//     priorStates.set(model, lastData);
//   }

//   return [
//     {
//       priorStates,
//       changesets,
//     },
//     notifications,
//   ];
// }
