---
title: "我是如何使用 ClaudeCode 进行编码的"
date: 2026-01-11
description: "分享近期摸索出来的 Claude Code 编程工作流实践，计划与执行分离，让 AI 一次做对"
categories: ["AI"]
---
使用 ClaudeCode 进行编码已经很久了，体验了 Claude 从 mcp、skill 再到 plugin 一步步以来的进化。近期才算探索出了一套效果不错的工作流，分享给大家。

# 工具集（TOOLSET）

我使用的工具有 kitty、Zed 以及 Claudecode。

**我在 kitty 中运行 ClaudeCode**

![](https://static.umupa.fun/2026/01/3fe564e0ccba04efc1c9e982eb3287a4.jpg)

为什么选择 kitty 而不是直接在 IDE 中运行 terminal、或者使用 VSCode 插件。两个原因：
1. [kitty](https://sw.kovidgoyal.net/kitty/) 是一个轻量级的终端，体验丝滑。由于终端无法随时编辑文件，相比 IDE 更能让我把注意力集中在与 「ClaudeCode」的对话上。事实上，我很少主动 coding，只进行 code review，所有的编码工作交给 Claude
2. 我相信你一定遇到过这样的场景：满怀信心地把任务交给 Claude，心想"这下可以去喝杯咖啡了"，切屏开始处理其他工作。十分钟后切回来，满心期待地想看看成果，结果发现 Claude 正在屏幕那头静静等你回来点个"确认授权"，血压直接就上来了😡。
   Kitty 可以解决这个问题，它支持系统通知，当 Claude Code 需要授权时，Mac 右上角会自动弹出提醒，再搭配 [ccmate](https://github.com/djyde/ccmate)，还能实时看到 Claude 正在调用什么 tool、任务是否完成。效果如下：
   ![](https://static.umupa.fun/2026/01/b48dc0779520862650893f25c6a14653.jpg)
   ![](https://static.umupa.fun/2026/01/5a33dd17a0986ce1ad0f331102b94ed6.jpg)
----
**我使用 superpowers 插件来提升编程效率和准确率**

当使用 AI 进行辅助编程时，或多或少会遇到这些问题：

- 代码质量差：说得有理有据，写出来的代码完全不能运行，甚至存在编译错误
- 需求理解偏差：需求理解错误，和我想实现的功能对不上
- 设计缺失：急于动手，数据结构、API 设计不优雅，缺乏整体架构思考，代码逐渐变成屎山
- ......

我们常常需要**花费大量的时间和 AI 进行多轮对话**，才能让它写出想要的代码。效率非常低下，还会加深我们的心智负担。

**「AI 似乎总是不能一次做对」**

[superpowers](https://github.com/obra/superpowers) 正是为了解决这个问题，它的核心理念是：先思考，再动手。当你提出一个需求，它不会急于写代码，而是先退一步问你"你真正想要实现什么"，通过对话梳理出完整的设计方案，再分步执行。

目前高强度使用了两周，非常好用，让我回到了第一次使用 ClaudeCode 时的惊艳感！作为一个 plugin，Github 有 16k 的 star，足以证明它的实力。
![](https://static.umupa.fun/2026/01/461b4d35f776fbcac3a09a37a2eadd46.jpg)
下面简单介绍下，superpower 是一套完整的 AI 编程工作流，本质上封装了多个“Skill”和“command”，内置 20+ 个设计得非常优雅的软件开发领域的 Skills，它的工作流围绕两个核心命令：

1. **/brainstorming - 脑暴阶段**: 和你反复确认需求细节、技术选型、方案权衡，最终输出设计文档和详细执行计划。这个执行计划非常非常的详细，会拆分为多个 task，每个 task 细分为多个 step，每个 step 会写明代码实现、验证步骤等
2. **/execute-plan - 执行阶段**: 根据计划逐步实现，每完成一步都会验证结果，确保不会跑偏

此外还内置了 TDD（测试驱动开发）、系统化调试、代码审查等专业 Skills，强调 YAGNI（不做过度设计）和 DRY（避免重复代码）原则。

如果你还没有使用，我建议你马上安装这个插件，肯定会让你感到惊艳。

----
**我使用 Zed 来串联我的工作流**

[zed](https://zed.dev/) 是一个编辑器，类似 vscode/cursor，但是它速度更快，原生支持 ACP、Zed Agent、LSP、自定义大模型 Provider等。具体可以看 zed 官网介绍，不展开。
我在 zed 中进行：
- 原始需求录入
- 代码 review（同时基于zed-agent进行代码理解，辅助我review）
- 改进项录入

工作流中会详细描述我是如何「串联」这些流程的。以下是我的 zed 编辑器界面，分成三个区域，zed-agent，code-review 和 fileTree（我习惯把项目文件放在右侧，Agent 放在左侧，和 cursor 的 Agent 模式一样）。
  ![](https://static.umupa.fun/2026/01/ef798a17095f22c2d3461fc906e54b11.jpg)
  

# 工作流（WORKFLOW）

我的工作流是一个围绕 superpowers 的 **Loop**，核心思想是 **master** 和 **worker** 分离：

- **脑暴会话 (master)**：专注于思考和设计，输出高质量的设计文档和执行计划
- **执行会话 (worker)**：专注于代码实现，执行详细的计划

![](https://static.umupa.fun/2026/01/d34de1cbbb415510bc9809c8df730519.jpg)

1、**需求录入** - 首先我会在 Zed 上进行需求录入，采用 md 格式。这一步非常重要，我大概有 30% 的时间花在需求录入上，我会把能想到的关于此需求的背景、最终目标、可行的技术方案、风险点、外部 API 文档等等一切资源，都在需求文档中说明。对于需求文档，我不会太在意格式，会有比较多口语化的表达。

2、**脑暴阶段** - 把需求 MD 喂给 Claude，调用 `/superpowers:brainstorm` 和 claude 进行思维碰撞。这个阶段不写任何代码，只讨论设计方案和实现细节，最终输出 `design.md` 和 `implement.md`，保证最终的实现方案是完美符合我的预期的。

3、 **执行阶段** - 这里我会选择新起一个 ClaudeCode 会话，而不是在脑暴会话中进行代码实现。新会话的好处：一、原先脑暴会话已经经过多轮对话了，一般情况下上下文会比较满，新会话响应更快，并且不会“犯傻”；二、`implement.md` 足够详细，无需额外上下文

4、 **CodeReview** - 在 Zed 中进行代码审查和功能验收。关于代码审查，对于一些代码细节和实现原理，这里我会使用 zed-agent 来辅助我进行代码 review，当然，你也可以在终端新建一个 ClaudeCode 会话或者使用 Zed的 Claude Agent。**原则是尽量不在脑暴和执行会话中引入太多不必要的问题，保持这两个会话的「干净」**。发现问题后，将改进项写入新的需求 MD

5、 **LOOP** - 改进项 MD 喂回脑暴会话，开始下一轮迭代

**非常简单，但是效果超群。充分的前期设计可以提升 AI 的效率和质量，避免多次的来回拉扯。**

举个真实案例：我用这套工作流将个人博客从 Quarz 框架迁移到 Astro 框架。脑暴阶段确认好设计方案后，我让 Claude 执行计划，然后就去睡午觉了。醒来发现 Claude Code 已经完美完成任务——中间零中断，一次成功，共计 5000+ 行代码变更。

> 完整 commit：[Umupa/blog@278232e](https://github.com/Umupa/blog/commit/278232ecfc8e81542c9cc6a2d65c7e78b486c329)

## TIPS

**关于我的模型选择**

- 脑暴会话使用 **Opus**：提升设计质量
- 执行会话使用 **Sonnet / GLM**：`implement.md` 已足够详细，轻量模型即可完成，节省 token
- zed-agent：选择使用 deepseek 模型，价格非常便宜，十块钱能用一个月，并且 Chat 的质量非常不错。

**使用 MD 进行规划**

这个理念与 [planning-with-files](https://github.com/OthmanAdi/planning-with-files) 一致，所有的需求录入、外部资源、项目规划、技术方案等我都采用持久化的 MD 格式，而不是直接在 Claude 对话中输入，原因是：

- Claude 会话上下文有限，内存中容易丢失，导致 Claude 偏离目标
- 记录所有错误、失败，避免重复
- 可复用、可回顾、可版本控制

**关于我安装的插件**
- superpowers - 必备
- context7 - 必备
- github
- commit-commands


# 关于 vibecoding 的看法
- 尽量使用 AI 写你熟悉的技术领域，vibecoding 一个你完全未知的技术领域是很可怕的，比如你是 Java 开发，使用 AI 写一个嵌入式的 C++ 项目，这会非常危险，因为你很难判断代码的好与坏。
- 要有明确的"spec"和"plan"，AI 也能写出优秀的代码。vibecoding 会是未来，而产品化思维、架构设计以及好的审美，将成为程序员"新的武器"。
- 你需要对 AI 生成的代码负全责。

# 推荐阅读

- [Claude Code 核心开发者 Boris Cherny 的 CC 工作流](https://x.com/bcherny/status/2007179832300581177)
- [Xuanwo 的 "How I Coding" 系列](https://xuanwo.io/series/how-i-coding/)

---

写于 2026.01.11 凌晨

Let's Vibe!
