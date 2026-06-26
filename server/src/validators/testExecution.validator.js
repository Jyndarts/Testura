const { z } = require('zod');

const stepResultSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  status: z.enum(['untested', 'pass', 'fail']).optional().default('untested'),
  actualResult: z.string().optional().default(''),
});

const updateExecutionSchema = z.object({
  status: z.enum(['untested', 'pass', 'fail', 'blocked', 'skipped']).optional(),
  stepResults: z.array(stepResultSchema).optional(),
  notes: z.string().optional(),
});

module.exports = { updateExecutionSchema };
