const Octokit = jest.fn().mockImplementation(() => ({
  rest: {
    users: {
      getAuthenticated: jest.fn().mockResolvedValue({ data: { login: 'mock' } }),
    },
    issues: {
      create: jest.fn().mockResolvedValue({ data: { number: 42 } }),
      createComment: jest.fn().mockResolvedValue({ data: {} }),
    },
  },
}));

module.exports = { Octokit };
