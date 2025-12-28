import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const universities = sqliteTable("universities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  tags: text("tags").notNull(),
  programs: text("programs").notNull(),
  verificationLevel: text("verification_level", {
    enum: ["basic", "strict"] as const,
  }).notNull(),
  website: text("website"),
});

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  universityId: text("university_id").notNull(),
  majors: text("majors").notNull(),
  interests: text("interests").notNull(),
  languages: text("languages").notNull(),
  bio: text("bio"),
  preferredLocations: text("preferred_locations").notNull(),
});

export const intentOptions = sqliteTable("intent_options", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  radiusKm: integer("radius_km"),
});

export const weightPresets = sqliteTable("weight_presets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  weightMajor: real("weight_major").notNull(),
  weightCampus: real("weight_campus").notNull(),
  weightActivity: real("weight_activity").notNull(),
  note: text("note").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull(),
});

export const verificationFlags = sqliteTable("verification_flags", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  required: integer("required", { mode: "boolean" }).notNull(),
});
