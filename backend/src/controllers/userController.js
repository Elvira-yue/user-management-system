const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const {
  toText,
  assertUserFields,
  assertUsername,
  assertPassword,
  toPublicUser
} = require('../utils/validate');

const SALT_ROUNDS = 10;

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest('用户 ID 不合法');
  }
  return id;
}

// GET /api/users 用户列表（分页 + 关键字搜索）
const list = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 10, 1), 100);
  const keyword = toText(req.query.keyword);

  const where = {};
  if (keyword) {
    where[Op.or] = [
      { username: { [Op.like]: `%${keyword}%` } },
      { fullName: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } },
      { city: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [['id', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize
  });

  return success(res, {
    list: rows.map(toPublicUser),
    total: count,
    page,
    pageSize
  });
});

// GET /api/users/:id 用户详情
const detail = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound('用户不存在');
  return success(res, toPublicUser(user));
});

// POST /api/users 新增用户
// 前端表单只提交 姓名/手机号/城市；未提供账号时使用手机号，未提供密码时使用 DEFAULT_PASSWORD
const create = asyncHandler(async (req, res) => {
  const fullName = toText(req.body.fullName);
  const phone = toText(req.body.phone);
  const city = toText(req.body.city);
  const username = toText(req.body.username) || phone;
  const password = typeof req.body.password === 'string' && req.body.password
    ? req.body.password
    : config.defaultPassword;

  const error =
    assertUserFields({ fullName, phone, city }) ||
    assertUsername(username) ||
    assertPassword(password);
  if (error) throw ApiError.badRequest(error);

  const exists = await User.findOne({
    where: { [Op.or]: [{ phone }, { username }] }
  });
  if (exists) {
    throw ApiError.conflict(exists.phone === phone ? '该手机号已被使用' : '该账号已存在');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    username,
    password: hashedPassword,
    fullName,
    phone,
    city
  });

  return success(res, toPublicUser(user), '新增用户成功', 201);
});

// PUT /api/users/:id 修改用户
const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound('用户不存在');

  const fullName = req.body.fullName === undefined ? user.fullName : toText(req.body.fullName);
  const phone = req.body.phone === undefined ? user.phone : toText(req.body.phone);
  const city = req.body.city === undefined ? user.city : toText(req.body.city);

  const error = assertUserFields({ fullName, phone, city });
  if (error) throw ApiError.badRequest(error);

  if (phone !== user.phone) {
    const phoneOwner = await User.findOne({
      where: { phone, id: { [Op.ne]: id } }
    });
    if (phoneOwner) throw ApiError.conflict('该手机号已被其他用户使用');
  }

  await user.update({ fullName, phone, city });
  return success(res, toPublicUser(user), '修改成功');
});

// DELETE /api/users/:id 删除用户
const remove = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === Number(req.user.id)) {
    throw ApiError.badRequest('不能删除当前登录的账号');
  }

  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound('用户不存在');

  await user.destroy();
  return success(res, null, '删除成功');
});

module.exports = {
  list,
  detail,
  create,
  update,
  remove
};
