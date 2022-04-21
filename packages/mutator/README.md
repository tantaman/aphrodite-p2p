# Mutator

Classes responsible for creating changes to a model and then committing those changes.

These classes are separate from the model given models will be immutable so we need a mutable copy/builder to do the modifications.

# Things to consider

## Multi user local-first apps & privacy...
https://consento.org/

wait wait... should the app even receive certain data? Certain CRDT events?

- A model with privacy settings should or should not be replicated over certain channels.
- Can we protect this with what keys a user has?
- Or do we have privacy rules and before shuttling off a CRDT event to a user on a given channel we evaluate the privacy from their perspective?

And if privacy changes...? They'll be missing update events for that specific model...
Unless we encode the entire model :|

If a client has _0_ events for a specific model then it can request a snapshot?
Flow of events is this:
1. Privacy is updated on a model
2. Peers x,y,z can now see it
3. Updates sent to them
4. They're missing initial state
5. They request it
6. Initial state sent over

Now this obviously places a huge burden on clients. They now need to evaluate privacy from everyone's perspective and have channels to everyone.

Maybe multi-key encryption is better? But then you have keys for every participant?

If you could have an enclave in the client that receives all updates but doesn't process one it should not be allowed to see...
Protects against benign users.
Problem when there are malicious users.

## ID Generation

Prefix with timestamp?
use `sid`?
nanoid and don't care?

## Atomicity...

If we need to change multiple models in one changeset, how do we do that?
What is the scope of a document in yjs speak?

For Strut, some updates are only across a single model. Other would be across multiple and need an atomic commit.
Do we create multiple document zones? Up-scope a doc to be an entire deck?

# Product Separation
If we have some product that load aggregations of data... and we don't want to mix streams.