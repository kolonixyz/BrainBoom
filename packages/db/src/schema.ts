import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ["developer", "admin", "member"] }).notNull().default("member"),
    passwordHash: text("password_hash"),
    accessCodeId: integer("access_code_id").references(() => accessCodes.id, { onDelete: "set null" }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accessCodes = sqliteTable("access_codes", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    role: text("role", { enum: ["admin", "member"] }).notNull().default("member"),
    displayName: text("display_name").notNull(),
    createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    usedAt: integer("used_at", { mode: "timestamp" }),
    resetCount: integer("reset_count", { mode: "number" }).notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const contacts = sqliteTable("contacts", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    contactUserId: integer("contact_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const rooms = sqliteTable("rooms", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type", { enum: ["personal", "ruang_umum"] }).notNull(),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const roomMembers = sqliteTable("room_members", {
    roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.roomId, t.userId] }),
}));

export const messages = sqliteTable("messages", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    type: text("type", { enum: ["text", "image", "file", "voice"] }).notNull().default("text"),
    fileUrl: text("file_url"),
    replyTo: integer("reply_to").references(() => messages.id, { onDelete: "set null" }),
    isEdited: integer("is_edited", { mode: "boolean" }).notNull().default(false),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    deletedBy: integer("deleted_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const schedules = sqliteTable("schedules", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    projectName: text("project_name").notNull(),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
    status: text("status", { enum: ["pending", "in_progress", "urgent", "completed"] }).notNull().default("pending"),
    createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const notes = sqliteTable("notes", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    tags: text("tags"),
    createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const rateLimits = sqliteTable("rate_limits", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    key: text("key").notNull(),
    timestamp: integer("timestamp").notNull(),
});

// Type exports from Drizzle
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
export type SelectRoom = typeof rooms.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type SelectContact = typeof contacts.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
export type SelectSchedule = typeof schedules.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
export type SelectNote = typeof notes.$inferSelect;
export type InsertAccessCode = typeof accessCodes.$inferInsert;
export type SelectAccessCode = typeof accessCodes.$inferSelect;
