const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    bugKey: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bugType: {
      type: String,
      enum: ['UI', 'Functional', 'Performance', 'Security', 'Compatibility', 'Content', 'Usability'],
      default: 'Functional',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'],
      default: 'open',
    },
    url: {
      type: String,
      default: '',
    },
    environment: {
      type: String,
      default: '',
    },
    stepsToReproduce: {
      type: String,
      default: '',
    },
    expectedResult: {
      type: String,
      default: '',
    },
    actualResult: {
      type: String,
      default: '',
    },
    linkedTestCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase',
      default: null,
    },
    linkedExecution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestExecution',
      default: null,
    },
    githubIssueNumber: {
      type: Number,
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bug', bugSchema);
