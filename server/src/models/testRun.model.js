const mongoose = require('mongoose');

const testRunSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['smoke', 'regression', 'sanity', 'custom'],
      default: 'custom',
    },
    description: {
      type: String,
      default: '',
    },
    testCases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestCase',
      },
    ],
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestRun', testRunSchema);
