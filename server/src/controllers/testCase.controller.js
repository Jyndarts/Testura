const TestCase = require('../models/testCase.model');
const { success, error } = require('../utils/apiResponse');

const createTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.create({
      ...req.body,
      project: req.project._id,
      createdBy: req.user.id,
    });

    res.status(201).json(success(testCase));
  } catch (err) {
    next(err);
  }
};

const getTestCases = async (req, res, next) => {
  try {
    const filter = { project: req.project._id };

    if (req.query.module) {
      filter.module = req.query.module;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const testCases = await TestCase.find(filter).sort({ createdAt: -1 });

    res.json(success(testCases));
  } catch (err) {
    next(err);
  }
};

const getTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findOne({
      _id: req.params.testCaseId,
      project: req.project._id,
    });

    if (!testCase) {
      return res.status(404).json(error('Test case not found'));
    }

    res.json(success(testCase));
  } catch (err) {
    next(err);
  }
};

const updateTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findOneAndUpdate(
      { _id: req.params.testCaseId, project: req.project._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!testCase) {
      return res.status(404).json(error('Test case not found'));
    }

    res.json(success(testCase));
  } catch (err) {
    next(err);
  }
};

const deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findOneAndDelete({
      _id: req.params.testCaseId,
      project: req.project._id,
    });

    if (!testCase) {
      return res.status(404).json(error('Test case not found'));
    }

    res.json(success(null, 'Test case deleted'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTestCase,
  getTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
};
