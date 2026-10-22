const { ValidationError } = require('sequelize');

// 全局错误处理中间件，保证所有异常都返回统一 JSON 结构
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err.status || 500;
  let message = err.message || '服务器内部错误';

  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    const field = err.errors && err.errors[0] ? err.errors[0].path : '';
    if (field === 'phone') {
      message = '该手机号已被使用';
    } else if (field === 'username') {
      message = '该账号已存在';
    } else {
      message = '数据已存在，请检查输入';
    }
  } else if (err instanceof ValidationError) {
    status = 400;
    message = (err.errors && err.errors[0] && err.errors[0].message) || '参数校验失败';
  } else if (err.name === 'SequelizeConnectionRefusedError' || err.name === 'SequelizeConnectionError') {
    status = 503;
    message = '数据库连接失败，请检查 MySQL 服务是否启动以及 .env 配置';
  } else if (err.name === 'SequelizeDatabaseError') {
    status = 500;
    message = '数据库执行出错，请确认已执行建表脚本';
  }

  if (status >= 500) {
    console.error('[server error]', err);
  }

  return res.status(status).json({ code: status, message, data: null });
};
