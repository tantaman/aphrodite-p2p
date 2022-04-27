# Impl
- Track re-creates of previously deleted things (e.g., because undo) via Causal Length Set CRDT (crr paper)
- Implement hybrid logical clocks
- Put created and modified time on rows stamped with HLCs
- Implement syncing
- Enable integrity rules to roll back via new write violating syncs
  - e.g., dangling edges / pointing to deleted stuff
- Incorporate AbsurdSQL for storage
- Implement query layer (take from Aphrodite classic)

# Write
Posts on relational CRDTs

- Why transactions don't work
- Why integrity rules and undo-as-new-write are needed
  - dangling references
  - denormalizing calculations
- Why we can do clock per row?
- How we handle re-inserts of a previously deleted row, in the face of undo support b/c that clobbers guid idea
  - causal length clock
- Application layer vs schema layer for implementation?


---
People in the space... yjs ppl, automerge ppl, jlongster, geoffry lit, ink and switch ppl, https://hypercore-protocol.org/ ppl