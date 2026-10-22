const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const {
  toText,
  assertUsername,
  assertPassword,
  assertUserFields,
  toPublicUser
} = require('../utils/validate');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function buildAuthResult(user) {
  return {
    token: signToken(user),
    user: toPublicUser(user)
  };
}

// POST /api/auth/register 注册
const register = asyncHandler(async (req, res) => {
  const username = toText(req.body.username);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const fullName = toText(req.body.fullName);
  const phone = toText(req.body.phone);
  const city = toText(req.body.city);

  const error =
    assertUsername(username) ||
    assertPassword(password) ||
    assertUserFields({ fullName, phone, city });
  if (error) throw ApiError.badRequest(error);

  const exists = await User.findOne({
    where: { [Op.or]: [{ username }, { phone }] }
  });
  if (exists) {
    throw ApiError.conflict(exists.username === username ? '该账号已存在' : '该手机号已被使用');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    username,
    password: hashedPassword,
    fullName,
    phone,
    city
  });

  return success(res, buildAuthResult(user), '注册成功', 201);
});

// POST /api/auth/login 登录
const login = asyncHandler(async (req, res) => {
  const username = toText(req.body.username);
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    throw ApiError.badRequest('请输入账号和密码');
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new ApiError(401, '账号或密码错误');
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new ApiError(401, '账号或密码错误');
  }

  return success(res, buildAuthResult(user), '登录成功');
});

// GET /api/auth/profile 获取当前登录用户
const profile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(401, '账号不存在或已被删除');
  }
  return success(res, toPublicUser(user));
});

module.exports = {
  register,
  login,
  profile
};
