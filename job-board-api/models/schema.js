import { integer, pgTable, varchar, pgEnum,timestamp } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/gel-core";

export const roles = pgEnum("roles", ["user", "employer", "admin"]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 255, enum: roles }).default("user").notNull(),
  refreshtoken: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobsTable = pgTable("jobs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  salary_range: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  employerId: integer().references(() => usersTable.id).notNull(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applicationsTable = pgTable("applications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  jobId: integer().references(() => jobsTable.id).notNull(),
  seekerId: integer().references(() => usersTable.id).notNull(),
  status: varchar({ length: 255 }).notNull(),
  appliedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});


