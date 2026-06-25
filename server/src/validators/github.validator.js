const { z } = require('zod');

const connectRepoSchema = z.object({
  repoOwner: z.string().min(1, 'Repository owner is required'),
  repoName: z.string().min(1, 'Repository name is required'),
  token: z.string().min(1, 'Token is required'),
});

const syncRunResultSchema = z.object({
  issueNumber: z.number().int().positive('Issue number must be a positive integer'),
});

module.exports = { connectRepoSchema, syncRunResultSchema };
