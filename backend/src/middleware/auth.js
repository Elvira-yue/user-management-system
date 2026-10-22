const jwt = require('jsonwebtoken');
const config = require('../config');

function unauthorized(res, message) {
  return res.status(401).json({ code: 401, message, data: null });
}

/**
 * JWT 全局鉴权中间件。
 * 校验请求头 Authorization: Bearer <token>，通过后把用户信息挂到 req.user。
 */
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return unauthorized(res, '未登录或登录已过期');
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: payload.sub,
      username: payload.username
    };
    return next();
  } catch (err) {
    return unauthorized(res, '登录状态已失效，请重新登录');
  }
};
