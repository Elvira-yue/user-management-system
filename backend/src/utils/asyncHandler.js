// 包装异步控制器，自动把异常交给全局错误处理中间件
module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
