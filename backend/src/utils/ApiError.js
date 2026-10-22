class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  static badRequest(message = '请求参数有误') {
    return new ApiError(400, message);
  }

  static unauthorized(message = '未登录或登录已过期') {
    return new ApiError(401, message);
  }

  static notFound(message = '资源不存在') {
    return new ApiError(404, message);
  }

  static conflict(message = '数据已存在') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
