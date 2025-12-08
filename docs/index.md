# CoreTerra 项目文档索引

欢迎来到 CoreTerra 项目文档中心。本文档提供了所有核心文档的索引和导航。

## 文档概览

CoreTerra 是一个深度融合了 GTD (Getting Things Done) 高效工作流的团队协作系统，其核心流程遵循 C·O·R·E 模型。系统基于 Git 和纯文本文件构建，为技术与非技术团队提供一个完全透明、可审计且面向未来的工作流管理解决方案。

## 核心文档列表

### 1. [产品需求文档 (PRD)](1-requirement.md)

定义 C·O·R·E 工作流，明确双用户画像（CLI极客 vs Web端普通用户）的需求差异。

**主要内容**:
- 用户画像：CLI Power User 和 Web GUI User
- 核心流程：Capture -> Clarify -> Organize -> Review -> Engage 的状态流转逻辑
- 功能需求：关键功能点，特别是强制的'Role-based'约束
- 非功能需求：数据的'可审计性'和'AI可读性'

---

### 2. [数据模型与指标规范](2-data_schema.md)

定义"真理源头"（SSOT）与"索引"（SMI）的映射，以及核心算法公式。

**主要内容**:
- Frontmatter 定义 (YAML)：严格定义 ct_id, status, priority, role_owner 等字段
- 索引映射：SQLite tasks 表结构
- 指标算法：PQI (规划质量指数) 和 CAR (承诺准确率) 的数学公式
- AI数据契约：Event Log 的结构定义

---

### 3. [API 接口契约](3-api_contract.md)

确立前后端交互标准，特别是处理"原始文本"传输和并发控制。

**主要内容**:
- 端点定义：POST /tasks/, GET /tasks/{id}, PUT /status 等接口
- Pydantic 模型：请求和响应的Schema
- 并发控制：利用 updated_at 时间戳实现乐观锁
- 原子性说明：所有写操作作为原子事务执行

---

### 4. [界面与交互规范](4-ui_ux_spec.md)

设计面向非技术用户的友好界面，同时保持"文本即棋盘"的高效隐喻。

**主要内容**:
- 布局设计：三栏布局（左侧角色导航，中间编辑器/列表，右侧AI控制台）
- 组件规范：TaskListView 和 TaskDetailView
- 交互模式：通过 GUI 封装复杂的Git操作
- 游戏化反馈：XP、Gems和指标（PQI/CAR）的展示方式

---

### 5. [开发指南与架构规范](5-dev_guide.md)

指导开发者如何实现"原子性事务"这一最大技术难点。

**主要内容**:
- Monorepo 结构：/backend, /frontend, /cli 的目录结构
- 核心实现模式：原子性写入包装器
- Git操作规范：代码层面如何调用Git命令
- 错误处理：文件写入成功但Git提交失败时的回滚策略

---

### 6. [测试与验收策略](6-test_strategy.md)

确保系统的"可审计性"是被严格验证的。

**主要内容**:
- 测试分层：单元测试、集成测试、E2E测试
- 特殊验收标准（The Third Check）：验证Git Log是否生成了正确的提交记录
- 场景示例：使用 Gherkin 语法编写核心场景
- 性能基准：从CLI输入到Web端看到更新的最大容忍延迟

---

## 文档阅读建议

1. **新团队成员**: 建议按顺序阅读：需求文档 → 数据模型 → API契约 → UI/UX规范 → 开发指南 → 测试策略
2. **开发者**: 重点关注开发指南和API契约
3. **产品/设计**: 重点关注需求文档和UI/UX规范
4. **测试工程师**: 重点关注测试策略和数据模型

## 相关资源

- 项目根目录下的 `2-data_schema.md` 和 `3-api_contract.md` 是文档的副本，与 `docs/` 目录中的文档保持一致。

---

*最后更新: 2025年*

