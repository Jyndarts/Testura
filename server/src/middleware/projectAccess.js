const Project = require('../models/project.model');
const { error } = require('../utils/apiResponse');

const projectAccess = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json(error('Project not found'));
    }

    const isMember = project.members.some(
      (m) => m.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json(error('Access denied'));
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = projectAccess;
