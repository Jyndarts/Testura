const GitHubConnection = require('../models/githubConnection.model');
const Bug = require('../models/bug.model');
const TestRun = require('../models/testRun.model');
const TestExecution = require('../models/testExecution.model');
const githubService = require('../services/github.service');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const connectRepo = async (req, res, next) => {
  try {
    const { repoOwner, repoName, token } = req.body;

    try {
      await githubService.verifyToken(token);
    } catch {
      return res.status(400).json(error('Invalid GitHub token or unable to authenticate'));
    }

    let connection = await GitHubConnection.findOne({ project: req.project._id });

    const encryptedToken = githubService.encryptToken(token);

    if (connection) {
      connection.repoOwner = repoOwner;
      connection.repoName = repoName;
      connection.encryptedToken = encryptedToken;
      connection.connectedBy = req.user.id;
      await connection.save();
    } else {
      connection = await GitHubConnection.create({
        project: req.project._id,
        repoOwner,
        repoName,
        encryptedToken,
        connectedBy: req.user.id,
      });
    }

    res.json(success({
      repoOwner: connection.repoOwner,
      repoName: connection.repoName,
      connected: true,
    }, 'Repository connected'));
  } catch (err) {
    next(err);
  }
};

const getConnection = async (req, res, next) => {
  try {
    const connection = await GitHubConnection.findOne({ project: req.project._id });

    if (!connection) {
      return res.json(success({ connected: false }));
    }

    res.json(success({
      repoOwner: connection.repoOwner,
      repoName: connection.repoName,
      connected: true,
    }));
  } catch (err) {
    next(err);
  }
};

const disconnect = async (req, res, next) => {
  try {
    await GitHubConnection.findOneAndDelete({ project: req.project._id });
    res.json(success(null, 'Disconnected'));
  } catch (err) {
    next(err);
  }
};

const pushBugAsIssue = async (req, res, next) => {
  try {
    const bug = await Bug.findOne({
      _id: req.params.bugId,
      project: req.project._id,
    });

    if (!bug) {
      return res.status(404).json(error('Bug not found'));
    }

    const connection = await GitHubConnection.findOne({ project: req.project._id });
    if (!connection) {
      return res.status(400).json(error('No GitHub connection configured for this project'));
    }

    if (bug.githubIssueNumber) {
      return res.status(400).json(error('Bug already pushed as issue #' + bug.githubIssueNumber));
    }

    const title = `[${bug.bugKey}] ${bug.title}`;
    const bodyLines = [
      bug.description,
      '',
      '---',
      `**Bug ID:** ${bug.bugKey}`,
      `**Type:** ${bug.bugType}`,
      `**Severity:** ${bug.severity}`,
      `**Priority:** ${bug.priority}`,
      `**Environment:** ${bug.environment || 'N/A'}`,
      `**URL:** ${bug.url || 'N/A'}`,
      '',
      '### Steps to reproduce',
      bug.stepsToReproduce || 'N/A',
      '',
      '### Expected result',
      bug.expectedResult || 'N/A',
      '',
      '### Actual result',
      bug.actualResult || 'N/A',
    ];

    const issueNumber = await githubService.createIssue(connection, {
      title,
      body: bodyLines.join('\n'),
    });

    bug.githubIssueNumber = issueNumber;
    await bug.save();

    res.json(success({ issueNumber }, 'Bug pushed as GitHub issue'));
  } catch (err) {
    next(err);
  }
};

const syncRunResult = async (req, res, next) => {
  try {
    const { issueNumber } = req.body;

    if (!issueNumber) {
      return res.status(400).json(error('issueNumber is required'));
    }

    const run = await TestRun.findOne({
      _id: req.params.runId,
      project: req.project._id,
    });

    if (!run) {
      return res.status(404).json(error('Test run not found'));
    }

    const connection = await GitHubConnection.findOne({ project: req.project._id });
    if (!connection) {
      return res.status(400).json(error('No GitHub connection configured for this project'));
    }

    const summary = await TestExecution.aggregate([
      { $match: { testRun: run._id } },
      {
        $group: {
          _id: null,
          pass: { $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] } },
          fail: { $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } },
          skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);

    const counts = summary[0] || { pass: 0, fail: 0, blocked: 0, skipped: 0, total: 0 };

    const body = [
      `## Test run: ${run.name}`,
      `**Status:** ${run.status}`,
      `**Type:** ${run.type}`,
      '',
      '### Results',
      `- Pass: ${counts.pass}`,
      `- Fail: ${counts.fail}`,
      `- Blocked: ${counts.blocked}`,
      `- Skipped: ${counts.skipped}`,
      `- **Total:** ${counts.total}`,
      '',
      `_Synced from Testura_`,
    ].join('\n');

    await githubService.commentOnIssue(connection, issueNumber, body);

    res.json(success(null, 'Result synced to GitHub issue'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  connectRepo: asyncHandler(connectRepo),
  getConnection: asyncHandler(getConnection),
  disconnect: asyncHandler(disconnect),
  pushBugAsIssue: asyncHandler(pushBugAsIssue),
  syncRunResult: asyncHandler(syncRunResult),
};
