const { z } = require('zod');

const createTestRunSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['smoke', 'regression', 'sanity', 'custom']).optional().default('custom'),
  description: z.string().optional().default(''),
  testCases: z.array(z.string()).optional().default([]),
});

const updateTestRunSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  testCases: z.array(z.string()).optional(),
});

module.exports = { createTestRunSchema, updateTestRunSchema };
