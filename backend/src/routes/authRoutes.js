const express = require('express');
const authMiddleware = require('../middleware/auth');
const { register, login, profile } = require('../controllers/authController');

const router = express.Router();

// 公开接口
router.post('/register', register);
router.post('/login', login);

// 需要登录
router.get('/profile', authMiddleware, profile);

module.exports = router;
