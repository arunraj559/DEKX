import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Leave Requests Table
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nama: text("nama").notNull(),
  division: varchar("division", { length: 50 }).notNull(),
  situs: text("situs").notNull(),
  perihal: text("perihal").notNull(),
  noPaspor: text("no_paspor"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  keterangan: text("keterangan").notNull(),
  accLdr: text("acc_ldr").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Dashboard Settings Table
export const dashboardSettings = pgTable("dashboard_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  approverEmails: text("approver_emails").notNull(),
  adminPassword: text("admin_password").notNull(),
  maxAdvanceDays: text("max_advance_days").notNull().default("60"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Zod Schemas
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardSettingsSchema = createInsertSchema(dashboardSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertDashboardSettings = z.infer<typeof insertDashboardSettingsSchema>;
export type DashboardSettings = typeof dashboardSettings.$inferSelect;
