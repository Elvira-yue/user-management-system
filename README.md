# 用户管理系统（Vue3 + Vite + Element Plus / Express + Sequelize + MySQL）

一套前后端分离的用户管理系统：JWT 登录认证、bcrypt 密码加密、用户增删改查、路由守卫、接口跨域处理。

## 一、功能清单

- 注册、登录（bcrypt 加密存储密码，JWT 签发令牌）
- 未登录无法访问用户管理页面（前端路由守卫 + 后端接口鉴权双重保护）
- 用户列表（分页、关键字搜索）
- 新增 / 编辑 / 删除用户
- 用户详情页
- 统一的接口响应结构与错误提示

## 二、项目结构

```
user-management-system/
├── backend/                    # 后端服务
│   ├── .env                    # 本地配置（数据库、JWT 等）
│   ├── .env.example            # 配置模板
│   ├── package.json
│   └── src/
│       ├── app.js              # Express 应用、CORS、路由挂载
│       ├── server.js           # 启动入口（连接数据库、同步表结构、监听端口）
│       ├── config/
│       │   ├── index.js        # 环境变量读取
│       │   └── database.js     # Sequelize 连接配置
│       ├── models/
│       │   ├── User.js         # users 表模型
│       │   └── index.js
│       ├── middleware/
│       │   ├── auth.js         # JWT 全局鉴权中间件
│       │   └── errorHandler.js # 全局错误处理
│       ├── controllers/
│       │   ├── authController.js
│       │   └── userController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── userRoutes.js
│       └── utils/              # 统一响应、参数校验、ApiError、asyncHandler
├── frontend/                   # 前端项目
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js          # 开发代理（解决跨域）
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── api/                # axios 封装 + 接口定义
│       ├── router/             # 路由与登录守卫
│       ├── layouts/AppLayout.vue
│       ├── views/
│       │   ├── LoginView.vue
│       │   ├── RegisterView.vue
│       │   ├── UserListView.vue
│       │   └── UserDetailView.vue
│       ├── utils/              # token 存取、时间格式化
│       └── styles/main.css
└── sql/
    └── schema.sql              # MySQL 建表脚本
```

## 三、环境要求

- Node.js >= 18
- MySQL >= 5.7（推荐 8.0）
- npm >= 9

## 四、快速开始

### 1. 初始化数据库

方式一（推荐）：直接执行建表脚本（会自动创建库、表、唯一索引）

```bash
mysql -u root -p < sql/schema.sql
```

方式二：手动创建数据库，后端启动时会自动创建 `users` 表

```sql
CREATE DATABASE user_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 启动后端

```bash
cd backend
npm install
# 按需修改 .env 中的数据库账号密码
npm run dev        # 开发模式（nodemon）
# 或 npm start     # 普通启动
```

启动成功后输出：

```
[db] MySQL 连接成功：127.0.0.1:3306/user_management
[db] 数据表已同步
[server] 服务已启动：http://localhost:3000
```

健康检查：`http://localhost:3000/api/health`

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，先注册账号，登录后即可进入用户管理。

### 4. 联调验证流程

1. 打开 `/register` 注册一个账号 → 自动登录并跳转用户列表；
2. 点击「新增用户」，填写姓名、手机号、城市 → 列表出现新数据；
3. 点击「编辑」修改信息，点击「详情」查看单条数据，点击「删除」移除用户；
4. 退出登录或手动删除 localStorage 中的 `ums_token`，再访问 `/users` 会被路由守卫重定向到登录页；
5. 不带 token 直接请求 `http://localhost:3000/api/users` 会返回 401。

## 五、配置说明（backend/.env）

| 配置项 | 说明 | 默认值 |
| --- | --- | --- |
| `PORT` | 后端服务端口 | 3000 |
| `DB_HOST` | MySQL 地址 | 127.0.0.1 |
| `DB_PORT` | MySQL 端口 | 3306 |
| `DB_NAME` | 数据库名 | user_management |
| `DB_USER` | 数据库用户名 | root |
| `DB_PASSWORD` | 数据库密码 | 123456 |
| `DB_LOGGING` | 是否打印 SQL 日志 | false |
| `JWT_SECRET` | JWT 签名密钥（生产环境必须更换） | 开发默认值 |
| `JWT_EXPIRES_IN` | Token 有效期 | 7d |
| `CORS_ORIGIN` | 允许跨域的前端地址，逗号分隔；留空允许所有来源 | http://localhost:5173 |
| `DEFAULT_PASSWORD` | 新增用户未指定密码时的初始密码 | 123456 |

> 前端开发服务器端口如修改，需同步修改 `CORS_ORIGIN`，并保持 `frontend/vite.config.js` 中代理目标为后端实际地址。

## 六、接口文档

统一响应结构：

```json
{ "code": 0, "message": "success", "data": {} }
```

`code = 0` 表示成功；失败时 HTTP 状态码与 `code` 一致（400/401/404/409/500）。

| 方法 | 路径 | 说明 | 是否需要登录 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录，返回 token | 否 |
| GET | `/api/auth/profile` | 获取当前登录用户 | 是 |
| GET | `/api/users` | 用户列表（`page`、`pageSize`、`keyword`） | 是 |
| GET | `/api/users/:id` | 用户详情 | 是 |
| POST | `/api/users` | 新增用户 | 是 |
| PUT | `/api/users/:id` | 修改用户 | 是 |
| DELETE | `/api/users/:id` | 删除用户 | 是 |

鉴权方式：请求头携带 `Authorization: Bearer <token>`。

### 示例

```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456","fullName":"张三","phone":"13800138000","city":"杭州"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 获取列表（把 TOKEN 换成登录返回的 token）
curl "http://localhost:3000/api/users?page=1&pageSize=10&keyword=张" \
  -H "Authorization: Bearer TOKEN"

# 新增用户
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fullName":"李四","phone":"13900139000","city":"上海"}'
```

> 新增用户时前端只提交姓名、手机号、城市。后端默认以「手机号」作为登录账号、以 `DEFAULT_PASSWORD`（默认 123456）作为初始密码；也可在请求体中额外传 `username`、`password` 自定义。

## 七、跨域（CORS）处理

本项目采用「开发代理 + 后端 CORS」双保险：

1. `frontend/vite.config.js` 将 `/api` 代理到 `http://localhost:3000`，浏览器同源请求，从根源上避免跨域；
2. 后端 `app.js` 使用 `cors` 中间件，并对 `OPTIONS` 预检请求做了处理；允许 `Authorization` 请求头；
3. 若前端部署到独立域名，只需把后端 `.env` 的 `CORS_ORIGIN` 改为该域名（多个用逗号分隔），无需改代码。

## 八、关键实现说明

- **密码加密**：`bcryptjs`（纯 JS 实现的 bcrypt，避免 Windows 下原生模块编译问题，生成的哈希与 bcrypt 兼容），salt rounds = 10；数据库中不保存明文密码。
- **JWT**：登录/注册成功后签发 `{ sub: user.id, username }`，有效期 7 天；`middleware/auth.js` 校验失败统一返回 401。
- **双重路由保护**：前端 `router.beforeEach` 检查 localStorage 中的 token；后端所有 `/api/users` 路由统一挂载 `authMiddleware`，即使绕过前端也无法访问数据。
- **统一异常处理**：`asyncHandler` + `ApiError` + `errorHandler`，唯一键冲突（账号/手机号）返回 409 并给出明确提示。
- **表结构**：`sql/schema.sql` 与 Sequelize 模型保持一致（`full_name` 映射为 `fullName`，时间字段为 `created_at` / `updated_at`）。

## 九、常见问题

| 问题 | 排查方式 |
| --- | --- |
| 后端启动提示数据库连接失败 | 确认 MySQL 已启动、`.env` 中账号密码/库名正确，且数据库已创建 |
| `ER_ACCESS_DENIED_ERROR` | 数据库用户名或密码错误 |
| 前端请求 404 / 502 | 确认后端运行在 3000 端口，或修改 `vite.config.js` 的代理 target |
| 登录后接口返回 401 | token 过期或 JWT_SECRET 被修改，重新登录即可 |
| 新增/注册提示账号或手机号已存在 | `username`、`phone` 均有唯一索引，请更换后重试 |
| 端口被占用 | 修改 `backend/.env` 的 `PORT` 与前端代理 target，或释放端口 |
