const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

function createToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register(req, res) {
  const { name, email, password } = req.body;
  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'An account with this email already exists');
    }
    throw error;
  }
  const token = createToken(user);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user: publicUser(user), token }
  });
}

async function login(req, res) {
  const user = await User.findOne({ email: req.body.email, isActive: true })
    .select('+password +tokenVersion');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: publicUser(user), token: createToken(user) }
  });
}

function me(req, res) {
  res.json({ success: true, data: { user: publicUser(req.user) } });
}

async function logout(req, res) {
  await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
  res.json({ success: true, message: 'Logged out successfully' });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    skills: user.skills
  };
}

module.exports = { register, login, me, logout, publicUser };
