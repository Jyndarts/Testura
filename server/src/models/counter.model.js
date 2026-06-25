const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

counterSchema.index({ project: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);
