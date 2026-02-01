import { z } from "astro:content";

export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  coverImgSrc: z.string().url().nullable(),
  rating: z.number().min(0).max(5).optional(),
  thoughts: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string(),
  link: z.string().url().nullable(),
  repo: z.string().url().nullable(), // allow closed-source projects
  description: z.string(),
  techStack: z.array(z.string()),
  thumbnail: z.string().nullable(),
});

export const happeningsSchema = z.object({
  id: z.number(),
  happening: z.string(),
});

export const softwareToolSchema = z.object({
  id: z.number(),
  type: z.enum(["Text Editor", "Operating System"]),
  label: z.string().min(1),
  href: z.string().url(),
});

export const hardwarePartSchema = z.object({
  component: z.string(),
  label: z.string(),
  href: z.string().url().optional(),
});

export const hardwareToolSchema = z.object({
  id: z.number(),
  type: z.string(),
  label: z.string().optional(),
  href: z.string().url().optional(),
  parts: z.array(hardwarePartSchema).optional(),
});
