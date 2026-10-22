const PHONE_RE = /^1[3-9]\d{9}$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function toText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function assertUsername(username) {
  if (!username) return '账号不能为空';
  if (!USERNAME_RE.test(username)) return '账号需为 3-20 位字母、数字或下划线';
  return '';
}

function assertPassword(password) {
  if (!password) return '密码不能为空';
  if (password.length < 6 || password.length > 30) return '密码长度需为 6-30 位';
  return '';
}

function assertUserFields({ fullName, phone, city }) {
  if (!fullName) return '姓名不能为空';
  if (fullName.length > 50) return '姓名长度不能超过 50 个字符';
  if (!phone) return '手机号不能为空';
  if (!PHONE_RE.test(phone)) return '手机号格式不正确';
  if (!city) return '所在城市不能为空';
  if (city.length > 50) return '城市名称不能超过 50 个字符';
  return '';
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    phone: user.phone,
    city: user.city,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

module.exports = {
  PHONE_RE,
  USERNAME_RE,
  toText,
  assertUsername,
  assertPassword,
  assertUserFields,
  toPublicUser
};
