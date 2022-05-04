import knex from "knex";
import { simpleResolver } from "storage/Resolvers";

export function createDb() {
  return knex({
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
  });
}

export function createResolver(db: ReturnType<typeof createDb>) {
  return simpleResolver(async (q, b) => await db.raw(q, b));
}
