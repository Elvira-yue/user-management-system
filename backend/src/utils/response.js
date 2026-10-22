// 统一响应格式：{ code: 0, message, data }
function success(res, data = null, message = 'success', status = 200) {
  return res.status(status).json({ code: 0, message, data });
}

module.exports = { success };
