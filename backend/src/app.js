const express = require('express');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 跨域配置：默认允许所有来源，也可通过 .env 的 CORS_ORIGIN 指定前端地址
const corsOptions = config.corsOrigin
  ? {
      origin: config.corsOrigin.split(',').map((item) => item.trim()).filter(Boolean),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  : { origin: true };

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: { status: 'up', time: new Date().toISOString() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

app.use(errorHandler);

module.exports = app;
