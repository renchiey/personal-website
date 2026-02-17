import { file } from "astro/loaders";
import { defineCollection } from "astro:content";
import {
  bookSchema,
  happeningsSchema,
  hardwareToolSchema,
  projectSchema,
  softwareToolSchema,
} from "./schemas";

const completedBooks = defineCollection({
  loader: file("src/data/reading.json", {
    parser: (text) => JSON.parse(text).completedBooks,
  }),
  schema: bookSchema,
});

const inProgressBooks = defineCollection({
  loader: file("src/data/reading.json", {
    parser: (text) => JSON.parse(text).inProgressBooks,
  }),
  schema: bookSchema,
});

const notCompletedBooks = defineCollection({
  loader: file("src/data/reading.json", {
    parser: (text) => JSON.parse(text).notcompletedBooks,
  }),
  schema: bookSchema,
});

const projects = defineCollection({
  loader: file("src/data/projects.json", {
    parser: (text) => JSON.parse(text),
  }),
  schema: projectSchema,
});

const softwareTools = defineCollection({
  loader: file("src/data/me.json", {
    parser: (text) => JSON.parse(text).tools.software,
  }),
  schema: softwareToolSchema,
});

const hardwareTools = defineCollection({
  loader: file("src/data/me.json", {
    parser: (text) => JSON.parse(text).tools.hardware,
  }),
  schema: hardwareToolSchema,
});

const happenings = defineCollection({
  loader: file("src/data/me.json", {
    parser: (text) => JSON.parse(text).happenings,
  }),
  schema: happeningsSchema,
});

export const collections = {
  completedBooks,
  inProgressBooks,
  projects,
  notCompletedBooks,
  softwareTools,
  hardwareTools,
  happenings,
};
