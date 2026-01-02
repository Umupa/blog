# Astro 博客迁移 + 妙言样式集成设计方案

日期：2026-01-02

## 背景

将当前 Quarto 博客迁移到 Astro，并一比一复刻妙言笔记的 Markdown 渲染样式。

## 目标

- 文章正文渲染效果与妙言一致
- 保留当前博客的布局风格（导航、列表页）
- 更简洁的项目结构，完全掌控 HTML/CSS

## 保留的核心功能

- 文章列表页（首页）
- 文章详情页
- 导航栏（Blog / Weekly / About / GitHub）
- Giscus 评论系统

## 技术决策

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 字体 | 妙言 CDN (TsangerJinKai02-W04) | 与妙言完全一致 |
| 主题 | 仅浅色模式 | 简化实现 |
| 代码高亮 | 复刻妙言配色 | 一致性 |
| 文章格式 | 标准 .md | 与妙言一致 |

## 项目结构

```
blog/
├── src/
│   ├── layouts/
│   │   └── PostLayout.astro    # 文章页布局（引入妙言 CSS）
│   ├── pages/
│   │   ├── index.astro         # 首页（文章列表）
│   │   └── posts/[...slug].astro  # 文章详情页
│   ├── components/
│   │   ├── Header.astro        # 导航栏
│   │   └── Giscus.astro        # 评论组件
│   └── styles/
│       ├── typography.css      # 从妙言提取的排版样式
│       ├── base.css            # 基础样式 + 主题变量
│       ├── highlight.css       # 代码高亮配色
│       └── global.css          # 全局样式（布局、导航等）
├── content/
│   └── posts/                  # Markdown 文章
│       └── *.md
├── public/                     # 静态资源
└── astro.config.mjs           # Astro 配置
```

## 妙言样式集成

### CSS 文件来源

从 MiaoYan 项目复制：
- `/Users/lalaorya/learnspace/umupa/MiaoYan/Resources/DownView.bundle/css/typography.css`
- `/Users/lalaorya/learnspace/umupa/MiaoYan/Resources/DownView.bundle/css/base.css`
- `/Users/lalaorya/learnspace/umupa/MiaoYan/Resources/DownView.bundle/css/theme-light.css`

### 关键样式值

| 属性 | 值 | 说明 |
|------|-----|------|
| 字体 | TsangerJinKai02-W04 | 妙言 CDN |
| 行间距 | 1.74 | 中英文混排优化 |
| 字间距 | 0.04em | 微调可读性 |
| 段落间距 | 1.6em | 上下间距 |
| 标题字间距 | 0.05em | 大标题加宽 |
| 代码块圆角 | 8px | 现代化外观 |
| 引用块 | 左边框 4px + 圆角 8px | 妙言风格 |

### 文章页 HTML 结构

```html
<article class="markdown-body heti" id="write">
  <!-- Markdown 渲染内容 -->
</article>
```

使用 `.heti` 类名触发妙言的排版规则。

## 内容管理

### Frontmatter 格式

```yaml
---
title: 文章标题
date: 2026-01-01
description: 文章描述（可选）
---
```

### Astro Content Collections 配置

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
  }),
});

export const collections = { posts };
```

### 迁移步骤

1. 将 `posts/*.qmd` 重命名为 `content/posts/*.md`
2. 清理 Quarto 特有的 YAML 字段
3. 保留正文内容不变

## 页面布局

### 首页（文章列表）

```
┌─────────────────────────────────────┐
│  Umupa's blog                       │
│  写代码，投资，跑步，与生活         │
│  ─────────────────────────────────  │
│  Blog   Weekly   About   GitHub     │
│  ─────────────────────────────────  │
│                                     │
│   01        我想活出怎样的人生      │
│  2026年1月   人生规划 1.0...        │
│                                     │
└─────────────────────────────────────┘
```

### 文章详情页

```
┌─────────────────────────────────────┐
│  ← 返回                             │
│  ─────────────────────────────────  │
│  我想活出怎样的人生                 │
│  2026-01-01                         │
│  ─────────────────────────────────  │
│                                     │
│  <div class="markdown-body heti">   │
│     正文内容（妙言样式渲染）        │
│  </div>                             │
│                                     │
│  ─────────────────────────────────  │
│  Giscus 评论区                      │
└─────────────────────────────────────┘
```

## 实施步骤

1. **初始化 Astro 项目**
   - 创建新的 Astro 项目
   - 配置 Content Collections

2. **集成妙言样式**
   - 复制 typography.css、base.css 到项目
   - 配置字体（妙言 CDN）
   - 提取代码高亮配色

3. **构建页面组件**
   - Header.astro（导航栏）
   - PostLayout.astro（文章布局）
   - 首页 index.astro（文章列表）
   - 文章页 [...slug].astro

4. **迁移内容**
   - 复制 .qmd → .md
   - 清理 frontmatter

5. **集成 Giscus**
   - 添加评论组件

6. **部署配置**
   - 配置构建命令
   - 保持原有域名

## 预期成果

- 文章正文渲染效果与妙言一致
- 保留当前博客的布局风格
- 更简洁的项目结构
- 更快的构建速度
- 完全掌控 HTML/CSS，无框架样式冲突
