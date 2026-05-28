# 西大圈学生端 (UniApp)

基于 UniApp + Vue3 + TypeScript 开发的西大圈学生端应用，支持 H5 和小程序。

## 技术栈

- **框架**: UniApp + Vue3
- **UI库**: uView Plus
- **状态管理**: Pinia
- **类型检查**: TypeScript

## 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# H5 开发
pnpm dev:student

# 微信小程序开发
pnpm --filter @nwu-helper/student dev:mp-weixin
```

### 构建

```bash
# H5 构建
pnpm build:student

# 微信小程序构建
pnpm --filter @nwu-helper/student build:mp-weixin
```

## 项目结构

```
src/
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── food/           # 美食
│   ├── driving/        # 驾校
│   ├── services/       # 生活服务
│   ├── community/      # 讨论区
│   ├── about/          # 关于
│   ├── merchant/       # 商家详情
│   └── post/           # 帖子详情
├── components/         # 组件
├── api/                # API 封装
├── store/              # Pinia 状态管理
├── static/             # 静态资源
│   ├── images/         # 图片
│   └── tabbar/         # TabBar 图标
└── utils/              # 工具函数
```

## 功能特性

- ✅ 首页轮播图、活动展示、抽签吃饭
- ✅ 美食商家列表
- ✅ 驾校介绍
- ✅ 生活服务分类
- ✅ 讨论区帖子列表、发布
- ✅ 商家详情页
- ✅ 帖子详情页、点赞
- ✅ 微信入口引导

## 环境变量

创建 `.env` 文件配置 API 地址：

```
VITE_API_BASE=http://localhost:4000
```

## 注意事项

1. 需要先启动后端 API 服务
2. 小程序开发需要在 `manifest.json` 中配置 AppID
3. H5 开发默认端口为 5174，已配置代理到后端 4000 端口
