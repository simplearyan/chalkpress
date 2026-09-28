import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The canonical store lives OUTSIDE site/src — one folder per question.
// Frontmatter mirrors templates/index.md; `z.string()` fields are required
// at build time, so a half-filled index.md fails the build, not the user.
const subjects = defineCollection({
  loader: glob({
    pattern: 'subjects/**/index.md',
    // resolved from the project root (site/), NOT from src/content/
    base: '../content',
  }),
  schema: z.object({
    id: z.string(),
    subject: z.string(),
    topic: z.string(),
    title: z.string(),
    slug: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    source: z.string().default(''),
    answer_type: z.enum(['options', 'value', 'text']),
    answer: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      correct: z.boolean().default(false),
    })).default([]),
    status: z.enum(['draft', 'ai-draft', 'reviewed', 'scripted', 'animated', 'rendered', 'published']),
    assignee: z.string().default(''),
    tags: z.array(z.string()).default([]),
    // "given" spec-card (problem page, sticky aside). Rows are label/value
    // pairs; value may contain $...$ math. goal: the target expression.
    given: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).default([]),
    goal: z.string().default(''),
    // regeneration brief: expanded through the shared AI-prompt contract
    // (same format test-renderer's Copy AI Prompt emits)
    prompt: z.string().default(''),
    video: z.string().default(''),
    thumb: z.string().default(''),
    youtube: z.string().default(''),
    duration_ms: z.number().default(0),
  }),
});

export const collections = { subjects };
