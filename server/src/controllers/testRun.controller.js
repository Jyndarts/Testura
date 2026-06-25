const TestRun = require('../models/testRun.model');
const { success, error } = require('../utils/apiResponse');

const createRun = async (req, res, next) => {
  try {
    const testRun = await TestRun.create({
      ...req.body,
      project: req.project._id,
      createdBy: req.user.id,
    });

    await testRun.populate('testCases');

    res.status(201).json(success(testRun));
  } catch (err) {
    next(err);
  }
};

const listRuns = async (req, res, next) => {
  try {
    const filter = { project: req.project._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const runs = await TestRun.find(filter)
      .populate('testCases', 'title')
      .sort({ createdAt: -1 });

    res.json(success(runs));
  } catch (err) {
    next(err);
  }
};

const getRun = async (req, res, next) => {
  try {
    const run = await TestRun.findOne({
      _id: req.params.runId,
      project: req.project._id,
    }).populate('testCases');

    if (!run) {
      return res.status(404).json(error('Test run not found'));
    }

    res.json(success(run));
  } catch (err) {
    next(err);
  }
};

const updateRun = async (req, res, next) => {
  try {
    const run = await TestRun.findOne({
      _id: req.params.runId,
      project: req.project._id,
    });

    if (!run) {
      return res.status(404).json(error('Test run not found'));
    }

    if (run.status !== 'not_started') {
      return res.status(400).json(error('Can only edit runs with status not_started'));
    }

    if (req.body.name !== undefined) run.name = req.body.name;
    if (req.body.description !== undefined) run.description = req.body.description;
    if (req.body.testCases !== undefined) run.testCases = req.body.testCases;

    await run.save();
    await run.populate('testCases');

    res.json(success(run));
  } catch (err) {
    next(err);
  }
};

const cloneRun = async (req, res, next) => {
  try {
    const source = await TestRun.findOne({
      _id: req.params.runId,
      project: req.project._id,
    });

    if (!source) {
      return res.status(404).json(error('Test run not found'));
    }

    const clone = await TestRun.create({
      project: req.project._id,
      name: `${source.name} (copy)`,
      type: source.type,
      description: source.description,
      testCases: source.testCases,
      createdBy: req.user.id,
    });

    await clone.populate('testCases');

    res.status(201).json(success(clone));
  } catch (err) {
    next(err);
  }
};

const deleteRun = async (req, res, next) => {
  try {
    const run = await TestRun.findOneAndDelete({
      _id: req.params.runId,
      project: req.project._id,
    });

    if (!run) {
      return res.status(404).json(error('Test run not found'));
    }

    res.json(success(null, 'Test run deleted'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRun,
  listRuns,
  getRun,
  updateRun,
  cloneRun,
  deleteRun,
};
