# TODO
- more options on schema fields
- tests for all the things 
  - Property based tests?
- Example data builder (based on schema field examples) for integration tests?
  - Or at least some way to issue the create table statements based on a schema
  so we may thereafter save our state.
- Spin up sync & replicate
- Reactive layer
- Generate `query` methods
- Wire query layer into cache layer...
  - This likely means we only ever select IDs from storage then run a second
  query to actually fetch columns... based on delta with cache...
  - Can optimized based on result set size (if knonw..)
- Stop using nanoid given the problems it generates for indices by not being able to be monotonically increasing. Back to `SID`?

Should the resolved DB speak in terms of Changesets and QueryPlans?
I.e., convert from those to the DB's native dialect?

How does this then play with SQLSourceExpression and the like?
-> SQLSourceExpression optimizes the plan for sql-ability then passes the optimized plan to the db which then converts
to an actual query string.

How will persistor work? Schemas are passed with changesets so this'll allow us to determine what to do.

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