# Persistor

For saving optimistic updates to disk (or wherever).

Models can be updated quickly for a real-time UI experience. Changesets are pushed into a log. Those changes are broadcast and picked up by integrations. E.g., sync channel, local db. Those integrations can batch and consume the changes at their own pace.

Note: does YJS do any batching and collapsing for prose-mirror based events?
We can technically collapse all events that target the same node and are issued by the current client.

E.g., if we update `foo.x` 100 times a second on the current client, all updates hit the same value. We only need to broadcast the latest change. We can collapse these on the client before sending over the wire.

So layered architecture would be:
1. Mutator created
2. Mutations applied against mutator
3. Changesets created for mutations
4. Changeset added to log
5. Log tailed
6. In-memory tailer commits the changes as they happen for responsive UI
   1. These would have to be reconciled with any CRDT events being received over the wire
7. CRDT sync tailer collapses events that target the same thing so we only send out latest one
   1. we'll have to define this precisely
8. Persitor tailer would persist how exactly?
   1. same crdt based persisting? toStoraging the entire targeted and in-memory model at current point in time?
   2. Could receive sync events for models not currently loaded into memory


If we had no collapsing to worry about...
1. Mutator
2. Mutations
3. Changeset as CRDT event
4. Changeset applied to in-memory model (reconciled against other CRDT events)
5. in-memory model triggers a persistence event to whole-sale persist the thing to on-disk storage
6. crdt events from this client sent over network to other clients


Maybe this also answers some problems in the first architecture list.

1. in-memory models represent the truth of state.
2. updating in-memory models produces events for the persistence layer to handle to record the current truth to disk.

Now if we receive CRDT events for models not yet in memory we load them to memory and run the updates through the standard path. These references will be weakly held so the client can GC the models that it doesn't currently care about but did receive updates for.