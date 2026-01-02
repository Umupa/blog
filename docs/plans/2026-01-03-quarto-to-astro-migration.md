# Quarto 到 Astro 博客迁移方案

**日期:** 2026-01-03
**状态:** 已批准，待执行

## 背景

当前博客使用 Quarto 框架，已在 `/Users/lalaorya/learnspace/blog-astro/` 完成 Astro 重构。需要将重构后的代码迁移到原仓库 `/Users/lalaorya/learnspace/blog`，保留原有的 Git 历史和 GitHub 配置。

## 设计决策

### 关键选择

1. **Git 历史处理:** 保留完整历史 - 在原仓库 main 分支继续开发，新的 Astro 代码作为新的 commit 加入
2. **blog-astro 提交:** 合并为单个迁移 commit - 创建一个清晰的 "feat: 从 Quarto 迁移到 Astro" commit
3. **旧文件处理:** 全部删除 - 移除所有 Quarto 相关文件，保持仓库干净
4. **GitHub Actions:** 修改现有 workflow - 更新 `deploy.yml` 为 Astro 构建流程

### 优势

- 保留原仓库的所有 commit 历史（10+ commits）
- 保留原仓库的 GitHub 配置（workflows, secrets, settings）
- 单个清晰的迁移 commit，容易理解和回滚
- 不需要处理复杂的 git 分支合并
- 保持工作目录干净整洁

## 执行步骤

### 步骤 1: 准备工作

```bash
cd /Users/lalaorya/learnspace/blog
git checkout main
git status  # 确保工作目录干净
git branch backup-quarto-$(date +%Y%m%d)  # 创建备份分支
```

### 步骤 2: 清理旧文件

删除以下 Quarto 相关文件：
- `*.qmd` 文章源文件
- `_quarto.yml` 配置文件
- `styles.css` 样式文件
- `_site/` 构建输出目录
- `posts/` 目录（旧的文章目录）
- `about.qmd`
- 其他 Quarto 相关文件

**保留:**
- `.git/` 目录
- `.github/` 目录（稍后更新）
- `.gitignore`（稍后更新）

### 步骤 3: 复制 Astro 文件

从 `/Users/lalaorya/learnspace/blog-astro/` 复制：
- 所有源代码目录：`src/`
- 配置文件：`astro.config.mjs`, `tsconfig.json`, `package.json`
- 依赖锁文件：`pnpm-lock.yaml`
- 公共资源：`public/` (如果有)

### 步骤 4: 更新 .gitignore

合并两个仓库的 .gitignore 规则：
- 移除 Quarto 相关规则（`/.quarto/`, `/_site/` 等）
- 添加 Astro 相关规则：

```gitignore
# Astro
node_modules/
dist/
.astro/

# 环境变量
.env

# 系统文件
.DS_Store
```

### 步骤 5: 更新 GitHub Actions

修改 `.github/workflows/deploy.yml`：

**移除:**
- Quarto 设置步骤

**添加:**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install

- name: Build Astro site
  run: pnpm build
```

**更新:**
- `publish_dir`: 从 `./_site` 改为 `./dist`

### 步骤 6: 创建迁移 commit

```bash
git add -A
git commit -m "feat: 从 Quarto 迁移到 Astro

- 使用 Astro 框架重构博客
- 保留 MiaoYan 风格的 markdown 渲染
- 集成 Giscus 评论系统
- 创建 About Me 页面
- 更新 GitHub Actions 构建流程

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
"
```

### 步骤 7: 本地验证

```bash
pnpm install
pnpm dev
```

验证内容：
- ✅ 首页文章列表显示正常
- ✅ 文章详情页渲染正确
- ✅ About 页面可访问
- ✅ 导航链接工作正常
- ✅ Giscus 评论加载（需要配置 repo-id）

### 步骤 8: 推送和部署验证

```bash
git push origin main
```

验证：
- ✅ GitHub Actions 成功运行
- ✅ `cf-pages` 分支正确更新
- ✅ Cloudflare Pages 部署成功
- ✅ 线上访问正常

### 步骤 9: 清理（可选）

```bash
# 删除临时仓库
rm -rf /Users/lalaorya/learnspace/blog-astro
```

或保留作为实验环境。

## 回滚方案

如果迁移后出现问题：

**方案 1: 重置到备份点**
```bash
git reset --hard backup-quarto-<date>
git push origin main --force
```

**方案 2: 撤销迁移 commit**
```bash
git revert <migration-commit-hash>
git push origin main
```

## 文件清单

### 需要删除的文件
- `_quarto.yml`
- `styles.css`
- `about.qmd`
- `index.qmd`
- `posts/*.qmd`
- `_site/`
- `favicon.svg`

### 需要复制的文件
- `src/`（整个目录）
- `astro.config.mjs`
- `tsconfig.json`
- `package.json`
- `pnpm-lock.yaml`
- `public/`（如果有）

### 需要更新的文件
- `.gitignore`
- `.github/workflows/deploy.yml`
- `README.md`（可选）

## 注意事项

1. 确保在执行前创建备份分支
2. 迁移后需要配置 Giscus 的 repo-id 和 category-id
3. 验证所有功能正常后再删除 blog-astro 目录
4. 如有自定义域名配置，确保 Cloudflare Pages 设置正确

## 成功标准

- ✅ 保留原仓库所有 Git 历史
- ✅ 本地开发服务器正常运行
- ✅ GitHub Actions 自动部署成功
- ✅ 线上访问所有页面正常
- ✅ 评论系统可用
- ✅ 样式和排版正确
