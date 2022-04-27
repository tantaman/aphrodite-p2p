---
sidebar_position: 2
---

# Core Concepts

Aphrodite speaks in terms of nodes and edges. I.e., your data model will be expressed via a graph structure.

# Nodes

Nodes are comprised of an `ID` (their primary key) and a set of `fields`.

<!-- |id|field1|field2|...|
|-- | -- | -- | -- | -->

# Edges

Edges express how nodes are connected to one another. Edges can be defined on a node by storing the `ID` to another node or defined indepdently of a node.

When edges are defined on a node they're called field edges and/or foreign key edges.

Edges defined independently of a node are called junction edges.

# Mutators

# Changesets

# Queries

# Logs