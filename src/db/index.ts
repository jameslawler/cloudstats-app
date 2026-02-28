import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb(db?: D1Database) {
    if (db) {
        return drizzleD1(db, { schema });
    }

    throw new Error("No database configuration found");
}

export type DrizzleClient = ReturnType<typeof getDb>;