const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const env = require('../config/env');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json(error('Email already registered'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ id: user._id }, env.jwtSecret, {
      expiresIn: '7d',
    });

    res.status(201).json(
      success({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      })
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(error('Invalid email or password'));
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json(error('Invalid email or password'));
    }

    const token = jwt.sign({ id: user._id }, env.jwtSecret, {
      expiresIn: '7d',
    });

    res.json(
      success({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      })
    );
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json(error('User not found'));
    }

    res.json(success({ id: user._id, name: user.name, email: user.email }));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register: asyncHandler(register),
  login: asyncHandler(login),
  getMe: asyncHandler(getMe),
};
