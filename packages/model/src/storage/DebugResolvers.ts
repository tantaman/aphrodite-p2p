import { Engine, StorageType } from "./storageType";
import { DBResolver } from "./DBResolver";

export const printResolver: DBResolver = spyResolver((query, bindings) =>
  console.log(query, bindings)
);

export const noopResolver: DBResolver = spyResolver((_, __) => {});

export function spyResolver(
  spy: (query: string, bindings: readonly any[]) => void
): DBResolver {
  return {
    type(t: StorageType) {
      return {
        engine(engine: Engine) {
          return {
            db(db: string) {
              return {
                async exec(
                  query: string,
                  bindings: readonly any[]
                ): Promise<any> {
                  spy(query, bindings);
                },
              };
            },
          };
        },
      };
    },
  };
}
