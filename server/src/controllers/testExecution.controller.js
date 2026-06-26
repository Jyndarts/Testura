const TestRun = require('../models/testRun.model');
const TestCase = require('../models/testCase.model');
const TestExecution = require('../models/testExecution.model');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const startRun = async (req, res, next) => {
  try {
    const run = await TestRun.findOneAndUpdate(
      { _id: req.params.runId, project: req.project._id, status: 'not_started' },
      { $set: { status: 'in_progress', startedAt: new Date() } },
      { new: true }
    );

    if (!run) {
      const existingRun = await TestRun.findOne({
        _id: req.params.runId,
        project: req.project._id,
      });

      if (!existingRun) {
        return res.status(404).json(error('Test run not found'));
      }

      return res.json(success({ resumed: true }, 'Run already started'));
    }

    const executions = run.testCases.map((tcId) => ({
      testRun: run._id,
      testCase: tcId,
      project: req.project._id,
      status: 'untested',
      stepResults: [],
    }));

    await TestExecution.insertMany(executions);

    res.status(201).json(success({ resumed: false }, 'Run started'));
  } catch (err) {
    next(err);
  }
};

const getRunExecutions = async (req, res, next) => {
  try {
    const run = await TestRun.findOne({
      _id: req.params.runId,
      project: req.project._id,
    });

    if (!run) {
      return res.status(404).json(error('Test run not found'));
    }

    const executions = await TestExecution.find({
      testRun: req.params.runId,
    }).populate('testCase');

    res.json(success(executions));
  } catch (err) {
    next(err);
  }
};

const updateExecution = async (req, res, next) => {
  try {
    const execution = await TestExecution.findOne({
      _id: req.params.executionId,
      testRun: req.params.runId,
    });

    if (!execution) {
      return res.status(404).json(error('Execution not found'));
    }

    const { status, stepResults, notes } = req.body;

    if (status !== undefined) execution.status = status;
    if (stepResults !== undefined) execution.stepResults = stepResults;
    if (notes !== undefined) execution.notes = notes;

    if (status && status !== 'untested') {
      execution.executedBy = req.user.id;
      execution.executedAt = new Date();
    }

    await execution.save();

    const populated = await execution.populate('testCase');

    res.json(success(populated));
  } catch (err) {
    next(err);
  }
};

const completeRun = async (req, res, next) => {
  try {
    const run = await TestRun.findOne({
      _id: req.params.runId,
      project: req.project._id,
    });

    if (!run) {
      return res.status(404).json(error('Test run not found'));
    }

    run.status = 'completed';
    run.completedAt = new Date();
    await run.save();

    const summary = await TestExecution.aggregate([
      { $match: { testRun: run._id } },
      {
        $group: {
          _id: null,
          pass: { $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] } },
          fail: { $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } },
          skipped: { $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] } },
          untested: { $sum: { $cond: [{ $eq: ['$status', 'untested'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);

    const counts = summary[0] || {
      pass: 0, fail: 0, blocked: 0, skipped: 0, untested: 0, total: 0,
    };

    res.json(success({ status: 'completed', counts }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startRun: asyncHandler(startRun),
  getRunExecutions: asyncHandler(getRunExecutions),
  updateExecution: asyncHandler(updateExecution),
  completeRun: asyncHandler(completeRun),
};
