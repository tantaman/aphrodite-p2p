---
sidebar_position: 2
---

# Core Concepts

Aphrodite speaks in terms of nodes and edges. I.e., your data model will be expressed via a graph structure.

# Nodes

Nodes are comprised of an `ID` (their primary key) and a set of `fields`.

You can think of nodes like entries in a table. The table being the schema of the node, the entries being the instances.

<!-- |id|field1|field2|...|
|-- | -- | -- | -- | -->

# Edges

Edges express how nodes are connected to one another. Edges can be defined on a node by storing the `ID` to another node or defined indepdently of a node.

When edges are defined on a node they're called field edges and/or foreign key edges.

Edges defined independently of a node are called junction edges.

# Mutators

Nodes and edges should never be mutated directly. The reason is that we don't ever want our program to be in an inconsistent state.

Mutators create a mutable copy of the nodes and edges we'd like to change. Using mutators we can express all of the changes we'd like to make and then commit them all in one atomic action.

# Changesets

# Queries

# Logs

# Context

# Node Definition