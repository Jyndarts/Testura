const mongoose = require('mongoose');

const stepResultSchema = new mongoose.Schema(
  {
    stepIndex: { type: Number, required: true },
    status: {
      type: String,
      enum: ['untested', 'pass', 'fail'],
      default: 'untested',
    },
    actualResult: { type: String, default: '' },
  },
  { _id: false }
);

const testExecutionSchema = new mongoose.Schema(
  {
    testRun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestRun',
      required: true,
    },
    testCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    status: {
      type: String,
      enum: ['untested', 'pass', 'fail', 'blocked', 'skipped'],
      default: 'untested',
    },
    stepResults: [stepResultSchema],
    notes: {
      type: String,
      default: '',
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    executedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestExecution', testExecutionSchema);
