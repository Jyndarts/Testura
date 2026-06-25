const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema(
  {
    action: { type: String, default: '' },
    expectedResult: { type: String, default: '' },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'deprecated'],
      default: 'draft',
    },
    preconditions: {
      type: String,
      default: '',
    },
    steps: [stepSchema],
    tags: [String],
    githubIssueNumber: {
      type: Number,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestCase', testCaseSchema);
