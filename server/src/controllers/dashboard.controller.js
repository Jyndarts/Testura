const TestCase = require('../models/testCase.model');
const TestRun = require('../models/testRun.model');
const TestExecution = require('../models/testExecution.model');
const Bug = require('../models/bug.model');
const { success } = require('../utils/apiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const projectId = req.project._id;

    const [
      testCasesByStatus,
      latestRuns,
      openBugsBySeverity,
      totalCases,
      totalRuns,
      totalBugs,
    ] = await Promise.all([
      TestCase.aggregate([
        { $match: { project: projectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      TestRun.aggregate([
        { $match: { project: projectId } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'testexecutions',
            localField: '_id',
            foreignField: 'testRun',
            as: 'executions',
          },
        },
        {
          $addFields: {
            pass: {
              $size: {
                $filter: {
                  input: '$executions',
                  as: 'e',
                  cond: { $eq: ['$$e.status', 'pass'] },
                },
              },
            },
            fail: {
              $size: {
                $filter: {
                  input: '$executions',
                  as: 'e',
                  cond: { $eq: ['$$e.status', 'fail'] },
                },
              },
            },
            blocked: {
              $size: {
                $filter: {
                  input: '$executions',
                  as: 'e',
                  cond: { $eq: ['$$e.status', 'blocked'] },
                },
              },
            },
            skipped: {
              $size: {
                $filter: {
                  input: '$executions',
                  as: 'e',
                  cond: { $eq: ['$$e.status', 'skipped'] },
                },
              },
            },
            totalExecutions: { $size: '$executions' },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            type: 1,
            status: 1,
            createdAt: 1,
            pass: 1,
            fail: 1,
            blocked: 1,
            skipped: 1,
            totalExecutions: 1,
          },
        },
      ]),

      Bug.aggregate([
        { $match: { project: projectId, status: { $ne: 'closed' } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),

      TestCase.countDocuments({ project: projectId }),
      TestRun.countDocuments({ project: projectId }),
      Bug.countDocuments({ project: projectId }),
    ]);

    const formatByStatus = (arr) => {
      const map = {};
      arr.forEach((item) => {
        map[item._id] = item.count;
      });
      return map;
    };

    res.json(
      success({
        testCasesByStatus: formatByStatus(testCasesByStatus),
        latestRuns,
        openBugsBySeverity: formatByStatus(openBugsBySeverity),
        totals: {
          testCases: totalCases,
          testRuns: totalRuns,
          bugs: totalBugs,
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
