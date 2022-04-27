---
sidebar_position: 3
---

# Updating Nodes & Edges

Mutators are used like so --
```typescript
const person = Person.create(context).set({
  name: "Bill",
  age: 23,
  role: "developer",
}).save();

Person.update(person).set({
  name: "Bob",
  age: 24,
  role: "dancer",
}).save();
```