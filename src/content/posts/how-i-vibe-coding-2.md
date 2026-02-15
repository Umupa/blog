---
title: "How I Vibe Coding (2026-02 edition) "
date: 2026-02-15
description: "分享这段时间以来在 Vibe Coding 上的新尝试和思考"
categories: ["AI"]
---
距离我发布[第一篇 Vibe Coding 的文章](https://umupa.fun/posts/how-i-vibe-coding-1/)才一个多月，这一个月已经涌现出了非常多有趣的 coding 产品和模型，在 AI 领域，现在基本是按周为单位进行迭代了。

这篇文章会更新这段时间以来我在 Vibe Coding 上的新尝试和思考。


# MODEL - 模型选择
![](https://static.umupa.fun/2026/02/28cad940e56c9e10733b02ee352cc48a.jpg)

最大的新闻无疑是 Codex 5.3 和 Opus 4.6 模型的发布，目前使用了一周多，分享下我的感受。

Codex 5.3 模型是专门为 Coding 优化的。给我几个直接的体感就是：
- 在大型代码库的索引、分析和推理能力非常强，
- 相比 GPT 5.2，代码能力更进一步，并且速度提升非常大（实际测试过，同一个任务和提示词，GPT 5.2跑了13分钟，而Codex5.3只需要6分钟）
- 不会偷懒，能连续工作，一次做对的概率更大
它的缺点是：在通用能力上有所不足，比如需求分析、项目规划和系统设计能力还是不如 Opus 模型，更擅长基于已有设计进行迭代，而不是从零开始进行系统设计。

而 Opus 4.6 模型，相比 Opus 4.5，个人认为 Coding 层面提升并没有非常大。但综合能力更强，新推出的 Agent-Teams 功能非常好用。偷懒问题依然存在，Claude 模型倾向于尽快给出答案，而不是把问题彻底弄懂。

总而言之，如果你只需要 Coding，我认为现阶段 Codex 是性价比更高的模型。如果你需要一个综合能力更强的模型，Claude 更合适。当然你也可以全都要，采用 Claude 进行项目规划和系统设计，Codex 进行代码实现。

# TOOLSET - 工具集
我依然使用 Kitty、Zed 和 Superpower。

当然，最近也开始尝试 Codex-App，虽然在 UI 上很大程度"抄袭"了 conductor，但是体验下来非常不错。个人认为这是 OpenAI 在 coding 领域第一个产品力还不错的产品，真正做到了好用。

- 终于原生支持了 Plan 模式和 Skill（superpowers 也能在 Codex 使用）
- Worktree 和 Automations 体验丝滑

![](https://static.umupa.fun/2026/02/569d886ab28448c1ec3ff0e9fbcc02e7.jpg)


# 一些思考

## 我们是否还需要逐行 Code Review？
这是一个摆在所有开发者面前的问题。现在人类 Review 代码的速度已经完全跟不上 AI Generate 的速度了，逐行 Review 的方式会严重拖累软件迭代的效率。
先说说为什么我们需要 review AI 写的代码。本质还是置信度的问题，我们不相信 AI 写的代码，所以需要"二次确认"。解决问题的关键在于提升代码的质量，提升代码的置信度，提供几个思路：

1、AI 之间相互 Review。比如让一个更强的模型去 Review，或者让不同的模型交叉 Review。比如让 Opus 去 Review Codex 的代码，这听起来有点"赛博炼丹"的意思，虽然粗暴，但是有用。

2、TDD（测试驱动开发）或许将卷土重来。古法编程时代很多人反感 TDD 开发，原因是这种模式增加前期开发成本，许多人习惯先做业务代码，再补测试。但是现在有了 AI 编程，这些都不是问题，而测试驱动开发强制要求的测试先行，反而是提升 Coding 质量和置信度的关键。

工程师 Review 的重点需要转变为：数据结构、API 设计、项目结构、模块依赖，以及最终的结果验证，采用其他方式提升 AI 代码的置信度，而不是依赖人工去逐行 review。

## 品味和工程化思维依旧重要
这一章节就不班门弄斧了，推荐看一下 OpenClaw 的创始人 Peter Steinberger 和宝玉老师的文章，写得非常好。
- https://baoyu.io/blog/2026/02/01/peter-steinberger-interview
- https://baoyu.io/blog/2026/02/03/taste-engineering-thinking

我这里摘抄一些关键思想
>  - AI 是杠杆，不是替代品。它消灭了语法层面的痛苦，但真正被放大的是你原有的系统思维、架构能力和对好产品的直觉
> - 编程语言已经不重要了，重要的是你的工程思维。AI 只能帮你实现代码，但把需求想清楚、把系统设计清楚、把结果验证清楚，这些核心能力是 AI 无法取代的。如果缺乏人类的"品味"和"判断"介入，AI 产出的代码很可能只是"能跑但不好用"的垃圾（slop）。
> - 软件开发不只有代码开发，从需求提出 -> 系统设计 -> 代码开发 -> 结果验证。AI 只能完成代码开发，把需求描述清楚、识别什么才是好的系统设计，清楚的结果验证，这些能力是 AI 无法取代的，也是未来软件工程师的价值所在。

## 一个好想法是未来的稀缺资源
一个好想法是未来的稀缺资源，可惜很多人现在脑袋空空，给他再好的 AI 工具也不知道怎么用。AI 好比一把万能的锤子，但是怎么敲，敲在哪，因人而异。

对于独立开发者，这是最好的时代，大部份的软件需求，实现路径已经不再是难题。而一个好的想法，产品化思维以及怎么把你的产品"卖出去"，才是关键。



## 2026 年的编程主线方向

在我看来，2026 年的编程，有两个主线方向会越来越清晰：

首先是 Agent Teams。现在像 Kimi 的 Agent-Swarm、Claude Code 新版本的 Agent-Teams，以及之前的 Oh my OpenCode，其实都在围绕"团队合作、多 Agent"的思想做文章。
单 Agent 目前上下文有限，且短期内很难解决，这种方式不仅能通过并行开发提升效率，更能实现 1+1>2 的智慧聚合。比如，你有一个方案设计，完全可以交给 10 个 Claude 同时进行设计，再综合对比，最终收敛出最优解。

我在最近非常流行的 OpenClaw 上也尝试构建了一个 Agent Team，虽然效果目前不及预期，但是有些地方确实惊艳到我了，我坚信这是一个正确的方向，后面会写篇文章专门分享下我在 OpenClaw 上的实践。
![](https://static.umupa.fun/2026/02/d75fc336c70930cfa102e5cc6c84f957.jpg)

其次，短期内，多模型的使用是必然。很明显，当前阶段各家模型都有自己独特的特点和优势。
- Claude 综合能力强
- OpenAI 擅长推理和 coding 能力
- Gemini 在多模态、写作和绘图方面远超其他模型

结合不同模型的长处，灵活运用，将是我们提升 Vibe Coding 效率和质量的关键。


# Don't die, and don't forget to live
2026 年刚开始没多久，OpenClaw、Moltbook、Kimi 2.5、Codex 5.3、Opus 4.6 相继发布，毫无疑问，现在正处于时代的"奇点"，我们该如何面对这个疯狂的时代，令人惶恐，也令人着迷。身为程序员处于这个时代，既是幸运的——能亲身经历技术与时代的变革；也是不幸的——惶恐这股浪潮会把我们拍死在沙滩上。

https://x.com/mckaywrigley/status/2019509652099330057

这是twitter上一位博主在 Opus 4.6 和 Codex 5.3 同时发布当天写的，摘录几段
![](https://static.umupa.fun/2026/02/605ce99fe72936319791b6377d1c0e17.jpg)

> Best advice is probably just be happy and don't die I guess? Or put more beautifully: don't forget to live.
>
> 最好的建议大概就是开心点、别死掉？或者说得好听点：别忘了生活。
>
> It gets even weirder when you consider that the average person has absolutely no clue that any of this is happening… it all sounds so schizo even though it's obviously not.
> 
> 更奇怪的是，普通人完全不知道这些正在发生……说出来听起来像精神分裂，尽管显然不是。
>
> Turns out that living through the singularity is pretty wild.
> 
> 原来亲历奇点是这种感觉，挺疯的。

但正如作者所言，最好的建议是：Don't die, and don't forget to live.
