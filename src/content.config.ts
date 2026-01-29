import { file } from "astro/loaders";
import { defineCollection } from "astro:content";
import {
  bookSchema,
  happeningsSchema,
  hardwareToolSchema,
  projectSchema,
  softwareToolSchema,
} from "./schemas";

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
  completed,
  inProgress,
  projects,
  notCompleted,
  softwareTools,
  hardwareTools,
  happenings,
};
