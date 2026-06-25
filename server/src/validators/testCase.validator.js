const { z } = require('zod');

const stepSchema = z.object({
  action: z.string().optional().default(''),
  expectedResult: z.string().optional().default(''),
  order: z.number(),
});

const createTestCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  module: z.string().optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  status: z.enum(['draft', 'active', 'deprecated']).optional().default('draft'),
  preconditions: z.string().optional().default(''),
  steps: z.array(stepSchema).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  githubIssueNumber: z.number().int().positive().nullable().optional().default(null),
});

const updateTestCaseSchema = z.object({
  title: z.string().min(1).optional(),
  module: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['draft', 'active', 'deprecated']).optional(),
  preconditions: z.string().optional(),
  steps: z.array(stepSchema).optional(),
  tags: z.array(z.string()).optional(),
  githubIssueNumber: z.number().int().positive().nullable().optional(),
});

module.exports = { createTestCaseSchema, updateTestCaseSchema };
