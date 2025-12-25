# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Quarto 的个人博客项目,使用 Quarto Website 模式生成静态站点,部署到 Netlify。

## 常用命令

### 本地开发
```bash
# 预览博客(带实时重载)
quarto preview

# 渲染整个站点
quarto render

# 清理构建输出
rm -rf _site .quarto
```

### 发布部署
```bash
# 发布到 Netlify
quarto publish netlify
```

### 内容管理
```bash
# 创建新文章(手动创建目录结构)
mkdir -p posts/new-post-name
touch posts/new-post-name/index.qmd
```

## 项目架构

### 目录结构
- `posts/` - 博客文章目录,每篇文章为独立子目录
  - `posts/_metadata.yml` - 所有文章的共享元数据配置(freeze: true, title-block-banner)
  - 每篇文章包含 `index.qmd` 和相关资源文件
- `_quarto.yml` - 主配置文件(网站设置、主题、导航栏)
- `_publish.yml` - 发布配置(Netlify 目标)
- `index.qmd` - 首页,自动列表显示所有文章(按日期倒序)
- `styles.css` - 自定义样式
- `cosmo-dark.scss` - 暗色主题样式
- `cloudflare.html` - Cloudflare Analytics 嵌入代码

### 内容渲染机制
- 首页使用 Quarto Listings 自动聚合 `posts/` 下所有文章
- 文章按 `date desc` 排序,支持分类和 RSS feed
- 所有文章默认启用 `freeze: true`,计算输出会被缓存

### 主题系统
- 亮色主题: Cosmo(内置)
- 暗色主题: `cosmo-dark.scss`(自定义)
- 全局样式: `styles.css`

### 发布流程
- 使用 `quarto publish netlify` 直接发布
- 目标站点: https://vocal-croissant-0f025c.netlify.app
- 生产域名: https://umupa.fun

## 开发注意事项

### 新增文章时
1. 在 `posts/` 下创建新目录(目录名使用 kebab-case)
2. 创建 `index.qmd`,必须包含 YAML frontmatter:
   ```yaml
   ---
   title: "文章标题"
   author: "作者名"
   date: "YYYY-MM-DD"
   categories: [分类1, 分类2]
   ---
   ```
3. 图片资源放在同一目录下,首图会自动用于文章列表

### 修改全局配置
- 网站元信息/导航栏: 编辑 `_quarto.yml`
- 文章默认选项: 编辑 `posts/_metadata.yml`
- 发布目标: 编辑 `_publish.yml`

### 代码执行
- 由于 `freeze: true`,包含代码的文章首次渲染后会缓存输出
- 更新代码输出需要删除 `_freeze/` 目录或修改文章内容
