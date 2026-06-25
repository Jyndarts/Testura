const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  key: z.string().min(1, 'Key is required').max(10),
  description: z.string().optional().default(''),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const addMemberSchema = z.object({
  email: z.string().email('Invalid email'),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
