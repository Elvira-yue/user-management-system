const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  list,
  detail,
  create,
  update,
  remove
} = require('../controllers/userController');

const router = express.Router();

// 所有用户管理接口必须登录
router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', detail);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
