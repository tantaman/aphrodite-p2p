# Model

The base classes that make up the client side data model.

These classes provide:
1. Lazy edges
2. Validation
3. Observability
   1. Rly? Or is that at mutator lvl? Or via `Ref` type declarations?

We can explore the idea of immutable models and if you want a "nominal reference" you can explicitly state that fact.
Nominal references can then be observed. To what degree? The ref entirely or individual props on it?

Or we can explore anemic models and redux...
