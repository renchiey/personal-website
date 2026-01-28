import { file } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const bookSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  author: z.string(),
  coverImgSrc: z.string().nullable(),
  rating: z.number().optional(),
  thoughts: z.string().optional(),
});

const ProjectSchema = z.object({
  title: z.string().min(1),
  link: z.string().url().nullable(),
  repo: z.string().url(),
  description: z.string(),
  techStack: z.array(z.string()),
  thumbnail: z.string().url().nullable(),
});

const completed = defineCollection({
  loader: file("src/data/reading.json", {
    parser: (text) => JSON.parse(text).completed,
  }),
  schema: bookSchema,
});

const inProgress = defineCollection({
  loader: file("src/data/reading.json", {
    parser: (text) => JSON.parse(text).inProgress,
  }),
  schema: bookSchema,
});

const notCompleted = defineCollection({
  loader: file("src/data/reading.json", {
    parser: (text) => JSON.parse(text).notCompleted,
  }),
  schema: bookSchema,
});

const projects = defineCollection({
  loader: file("src/data/projects.json", {
    parser: (text) => JSON.parse(text),
  }),
  schema: ProjectSchema,
});

export const collections = { completed, inProgress, projects, notCompleted };
