import { boolean } from "drizzle-orm/gel-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const applicationsTable = pgTable("applications", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    jobId: integer().references(() => jobsTable.id).notNull(),
    seekerId: integer().references(() => usersTable.id).notNull(),
    status: varchar({ length: 255 }).notNull(),
    appliedAt: varchar({ length: 255 }).notNull(),
});

export default applicationsTable;