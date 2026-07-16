import { drizzle } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";
import * as schema from "./schema";

const getD1Db = () => {
  let binding: any;
  try {
    const context = getRequestContext();
    binding = (context?.env as any)?.DB;
  } catch {

    // getRequestContext may throw outside request handlers
  }

  if (!binding) {
    // Return a mock Drizzle-like interface during build or server initialization
    // to avoid crashes, but throw if an actual query is attempted
    return new Proxy({} as any, {
      get() {
        return () => {
          throw new Error("Database query attempted outside an active Edge request context with a D1 binding.");
        };
      }
    });
  }

  return drizzle(binding, { schema });
};

export const db = new Proxy({} as any, {
  get(target, prop) {
    const instance = getD1Db();
    const value = Reflect.get(instance, prop);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  }
});
