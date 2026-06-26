const Project = require('../models/project.model');
const User = require('../models/user.model');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createProject = async (req, res, next) => {
  try {
    const { name, key, description } = req.body;

    const project = await Project.create({
      name,
      key,
      description,
      members: [req.user.id],
      createdBy: req.user.id,
    });

    await project.populate('members', 'name email');

    res.status(201).json(success(project));
  } catch (err) {
    next(err);
  }
};

const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      members: req.user.id,
    }).populate('members', 'name email');

    res.json(success(projects));
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res) => {
  await req.project.populate('members', 'name email');
  res.json(success(req.project));
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (name !== undefined) req.project.name = name;
    if (description !== undefined) req.project.description = description;
    await req.project.save();
    await req.project.populate('members', 'name email');
    res.json(success(req.project));
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await req.project.deleteOne();
    res.json(success(null, 'Project deleted'));
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(error('User not found'));
    }

    const alreadyMember = req.project.members.some(
      (m) => m.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.status(409).json(error('User is already a member'));
    }

    req.project.members.push(user._id);
    await req.project.save();
    await req.project.populate('members', 'name email');

    res.json(success(req.project));
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    req.project.members = req.project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await req.project.save();
    await req.project.populate('members', 'name email');

    res.json(success(req.project));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject: asyncHandler(createProject),
  getMyProjects: asyncHandler(getMyProjects),
  getProject: asyncHandler(getProject),
  updateProject: asyncHandler(updateProject),
  deleteProject: asyncHandler(deleteProject),
  addMember: asyncHandler(addMember),
  removeMember: asyncHandler(removeMember),
};
