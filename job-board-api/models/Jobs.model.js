import { boolean } from "drizzle-orm/gel-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const jobsTable = pgTable("jobs", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    location: varchar({ length: 255 }).notNull(),
    salary_range: varchar({ length: 255 }).notNull(),
    category: varchar({ length: 255 }).notNull(),
    employerId: integer().references(() => usersTable.id).notNull(),
    isActive: boolean().default(true).notNull(),
});

export default jobsTable;