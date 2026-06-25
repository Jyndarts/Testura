const { z } = require('zod');

const createBugSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  bugType: z.enum(['UI', 'Functional', 'Performance', 'Security', 'Compatibility', 'Content', 'Usability']).optional().default('Functional'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'reopened']).optional().default('open'),
  url: z.string().optional().default(''),
  environment: z.string().optional().default(''),
  stepsToReproduce: z.string().optional().default(''),
  expectedResult: z.string().optional().default(''),
  actualResult: z.string().optional().default(''),
  linkedTestCase: z.string().nullable().optional().default(null),
  linkedExecution: z.string().nullable().optional().default(null),
  githubIssueNumber: z.number().int().positive().nullable().optional().default(null),
});

const updateBugSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  bugType: z.enum(['UI', 'Functional', 'Performance', 'Security', 'Compatibility', 'Content', 'Usability']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'reopened']).optional(),
  url: z.string().optional(),
  environment: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  linkedTestCase: z.string().nullable().optional(),
  linkedExecution: z.string().nullable().optional(),
  githubIssueNumber: z.number().int().positive().nullable().optional(),
});

const changeStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed', 'reopened']),
});

module.exports = { createBugSchema, updateBugSchema, changeStatusSchema };
