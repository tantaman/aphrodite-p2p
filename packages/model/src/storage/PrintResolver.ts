import { Engine, StorageType } from "../storage/storageType";
import { DBResolver } from "./DBResolver";

const resolver: DBResolver = {
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
                console.log(query, bindings);
              },
            };
          },
        };
      },
    };
  },
};

export default resolver;
