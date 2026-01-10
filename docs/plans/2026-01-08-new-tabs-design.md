# 博客新增 Tab 页面设计方案

## 概述

为博客新增两个 Tab 页面：读书笔记（Books）和投资理财（Investing）。

## 导航结构

```
Blog | Weekly | Books | Investing | About
```

## 内容架构

```
src/content/
├── posts/          # 现有 Blog 文章
├── books/          # 新增：读书笔记
│   └── book-name.md
└── investing/      # 新增：投资文章
    └── article.md
```

## 页面路由

| 路径 | 页面 |
|------|------|
| `/` | Blog 文章列表（现有） |
| `/books` | 读书笔记卡片网格 |
| `/books/[slug]` | 单本书笔记详情 |
| `/investing` | 投资文章列表 |
| `/investing/[slug]` | 投资文章详情 |

---

## 读书笔记页面设计

### 布局

网格卡片布局：
- 桌面：3-4 列
- 平板：2 列
- 手机：2 列

### 卡片设计

```
┌─────────┐
│  封面   │
│  (2:3)  │
├─────────┤
│ 书名    │
│ 作者    │
└─────────┘
```

- 封面图：统一比例 2:3，圆角 4px
- 书名：单行截断，链接蓝色 `#0C6ADA`
- 作者：灰色 `#777`
- 悬停：轻微上移 + 阴影
- 无边框，依靠封面和留白区分

### Frontmatter 结构

```yaml
---
title: "被讨厌的勇气"
author: "岸见一郎 / 古贺史健"
cover: "/covers/book-name.jpg"
date: 2024-01-15
---
笔记正文...
```

---

## 投资理财页面设计

### 布局

复用 Blog 时间线样式：

```
  15        投资理念：为什么我选择指数基金
 2024年3月   关于长期投资和复利的一些思考...
```

### Frontmatter 结构

```yaml
---
title: "投资理念：为什么我选择指数基金"
date: 2024-03-15
description: "关于长期投资和复利的一些思考"
categories: ["投资理念"]
---
正文...
```

---

## 实现清单

### 新建文件

- [ ] `src/content/books/` 目录
- [ ] `src/content/investing/` 目录
- [ ] `src/pages/books/index.astro` - 书籍卡片网格页
- [ ] `src/pages/books/[...slug].astro` - 笔记详情页
- [ ] `src/pages/investing/index.astro` - 文章列表页
- [ ] `src/pages/investing/[...slug].astro` - 文章详情页

### 修改文件

- [ ] `src/content/config.ts` - 添加 books 和 investing collection
- [ ] `src/components/Header.astro` - 导航增加 Books、Investing
- [ ] `src/styles/global.css` - 添加书籍卡片网格 CSS

### CSS 新增（约 50-60 行）

- `.book-grid` 响应式网格
- `.book-card` 卡片样式
- `.book-cover` 封面图样式
- 悬停动画
