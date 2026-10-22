const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models');

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log(`[db] MySQL 连接成功：${config.db.host}:${config.db.port}/${config.db.name}`);

    // 若表不存在则自动创建（表结构也可通过 sql/schema.sql 手动初始化）
    await sequelize.sync();
    console.log('[db] 数据表已同步');

    app.listen(config.port, () => {
      console.log(`[server] 服务已启动：http://localhost:${config.port}`);
      console.log(`[server] 健康检查：http://localhost:${config.port}/api/health`);
    });
  } catch (err) {
    console.error('[server] 启动失败：', err.message);
    console.error('[server] 请检查 MySQL 是否启动，以及 backend/.env 中的数据库配置');
    process.exit(1);
  }
}

bootstrap();
