# Aphrodite Local First

And exploration of [Aphrodite](https://github.com/tantaman/aphrodite) as:
1. P2P & Local first. No central server or DB. All data is persisted locally and replicated in a p2p manner between clients.
   1. Some ideas coming from [Conflict Free Replicated Relations](https://hal.inria.fr/hal-02983557/document) and [Hybrid Logical Clocks](https://cse.buffalo.edu/tech-reports/2014-04.pdf)
2. Typescript first. No code-gen, instead relying on mapped types. E.g., https://github.com/tantaman/aphrodite-local-first/blob/main/packages/model/src/Schema.ts#L104-L154

# Open Items
- end to end demo
- private p2p replication
- shared p2p replication with private realms
- e2ee
- support for IndexDB & AbsurdSQL in the browser
- backport learnings to regular Aphrodite & support languages besides typescript
