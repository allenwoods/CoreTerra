# CoreTerra 项目概览 - AI 助手指南

本文档旨在帮助 AI 助手快速理解 CoreTerra 项目的核心理念、架构设计和关键实现细节。详细文档请参考 `docs/` 目录下的相关文件。

## 1. 项目核心理念

CoreTerra 是一个深度融合了 GTD (Getting Things Done) 高效工作流的团队协作系统，其核心流程遵循 C·O·R·E 模型。系统基于 Git 和纯文本文件构建，为技术与非技术团队提供一个完全透明、可审计且面向未来的工作流管理解决方案。

### 1.1 战略定位

**弥合个人生产力与团队协作的鸿沟**：传统 GTD 方法在团队环境中存在协调开销和认知压力问题。CoreTerra 通过强制"角色即关注领域"（Roles are the Areas of Focus）的原则，将任务组织与既定组织角色绑定，从结构上解决了这一矛盾。

**关键约束**：所有任务从 `inbox` 状态迁移至 `active` 状态的唯一必要条件是必须为其分配一个 `role_owner`。这是系统的核心设计之一，确保了每一份工作量都能被归因和审计。

### 1.2 数据驱动的绩效量化

系统引入了三大核心指标，将主观的团队原则转化为可量化的数据：

- **PQI (Planning Quality Index, 规划质量指数)**：衡量从任务捕获到正式承诺执行之间的时间效率
  - 公式：`PQI = timestamp_commitment - timestamp_capture`
- **CAR (Commitment Accuracy Rate, 承诺准确率)**：衡量任务是否在其承诺的截止日期内完成
  - 公式：`CAR(task) = 1 if timestamp_completion <= due_date else 0`
- **SCS (Standard Compliance Score, 标准合规分数)**：根据链接的 Standard 要求，AI/同行评审的平均分数

### 1.3 AI 原生架构

系统从一开始就为与大语言模型（LLM）的深度集成而设计：

- **结构化纯文本基础**：采用 YAML Frontmatter 与 Markdown Body 的混合格式，确保 LLM 能够接收到语义清晰、结构化的输入
- **四个专业 AI 代理**：
  - **AI Reminder**：上下文感知推送与提醒
  - **AI Trainer**：合规指导与入职培训
  - **AI Reviewer**：流程优化与标准细化
  - **AI Participant**：自动化任务执行

### 1.4 可审计性

**Git 作为审计日志**：每一次对任务的创建、修改或状态变更都必须对应一次原子的 Git 提交（atomic Git commit）。提交信息遵循标准化格式，例如：
- `ADD: {Task ID} - {Task Title}`
- `COMPLETE: {Task ID}`
- `UPDATE: {Task ID} - {Change Description}`

这形成了一条完整的、不可篡改的"审计线索"，完美实现了 AI 系统所需的 lineage tracking。

### 1.5 非惩罚性游戏化机制

- **非惩罚性设计**：系统避免对失败进行直接的负面惩罚
- **社会强化机制（奖励反向分配）**：当个体遵守原则（如达到高 PQI）时，主要奖励池（XP/Gems）会分配给**团队其他成员**
- **双重奖励结构**：
  - **XP (经验值)**：与流程完成度挂钩，可预测的奖励
  - **Gems (宝石)**：授予卓越或稀有成就的不可预测奖励

## 2. 核心工作流：C·O·R·E 模型

C·O·R·E 工作流定义了系统内所有任务从诞生到归档的唯一生命周期路径：

1. **Capture (捕获)**：所有想法、需求和待办事项的唯一入口，初始状态为 `inbox`
2. **Clarify (澄清)**：明确任务性质（单步任务、项目、参考资料）
3. **Organize (组织)**：强制关联 `role_owner`，添加优先级、截止日期、标签等元数据，状态从 `inbox` 流转至 `active`
4. **Review (回顾)**：定期检视系统，评估优先级，设置 `timestamp_commitment`（承诺完成时间）
5. **Engage (执行)**：实际工作阶段，任务完成后状态流转至 `completed`，最终可归档为 `archived`

详细说明请参考：`docs/1-requirement.md`

## 3. 数据架构：混合持久化模型

CoreTerra 采用创新的混合持久化模型，兼顾数据完整性和查询性能：

### 3.1 SSOT (Single Source of Truth, 真理之源)

**MyST Markdown 文件**：
- 每个任务以独立的 `.md` 文件形式存储
- YAML Frontmatter 存储结构化元数据
- Markdown Body 存储详细描述、备注等非结构化内容
- 由 Git 进行版本控制，提供不可变的审计追踪

### 3.2 SMI (Searchable Metadata Index, 可搜索元数据索引)

**SQLite 数据库**：
- 仅镜像 Frontmatter 中的关键元数据字段
- 用于高性能查询、过滤和排序操作
- 不存储任务的详细描述（body）内容

### 3.3 核心字段定义

| 字段名 | 类型 | 描述 |
|--------|------|------|
| `ct_id` | String (UUID) | 全局唯一标识符，用于事件日志和流程追踪 |
| `status` | Enum | `inbox \| active \| completed \| archived` |
| `priority` | Integer | 1-5，5 为最高 |
| `role_owner` | String | 任务的责任角色（**必填**，从 inbox 转为 active 的强制约束） |
| `parent_id` | String (UUID, 可选) | 父任务的 ct_id。子任务是独立的任务实体，拥有完整的生命周期 |
| `timestamp_capture` | DateTime (ISO 8601) | 任务被捕获的时间点 |
| `timestamp_commitment` | DateTime (ISO 8601) | 任务被正式承诺执行的时间点 |
| `timestamp_completion` | DateTime (ISO 8601) | 任务完成的时间点 |
| `due_date` | Date (ISO 8601) | 承诺完成的目标日期 |

**子任务设计说明**：系统中不存在"子任务"这一独立类型，只有"有 parent_id 的任务"和"没有 parent_id 的任务"。所有任务都是独立的实体，拥有完整的元数据和 C·O·R·E 生命周期。当在父任务中添加子任务时，会创建一个新的任务并自动进入 Inbox。

详细数据模型定义请参考：`docs/2-data_schema.md`

### 3.4 原子性事务

所有创建、更新和删除（CUD）操作必须严格遵循以下顺序，作为一个不可分割的原子事务：

1. **文件系统写入**：创建或更新对应的 `.md` MyST Markdown 文件
2. **本地 Git 提交**：将文件的变更暂存并提交到本地 Git 仓库
3. **SQLite 索引更新**：更新 SQLite 数据库中的元数据索引

如果任何步骤失败，必须执行相应的回滚操作。详细实现规范请参考：`docs/5-dev_guide.md`

## 4. API 与并发控制

### 4.1 核心 API 端点

- `POST /tasks/`：创建新任务
- `GET /tasks/{task_id}`：获取任务详情（返回原始 MyST Markdown 字符串，前端负责渲染）
- `GET /tasks/`：查询任务列表（支持 status, priority, tag 等过滤条件）
- `PUT /tasks/{task_id}/status`：更新任务状态
- `PATCH /tasks/{task_id}`：修改任务元数据

所有写入操作都是原子性的，确保文件、Git 和数据库的一致性。

### 4.2 乐观锁并发控制

为防止并发写入导致的数据覆盖，系统实现乐观锁机制：

1. 客户端在请求中包含任务最后一次已知的 `updated_at` 时间戳
2. 后端在执行写入前，从 SQLite 索引中查询当前 `updated_at` 值
3. 如果时间戳不匹配，返回 `409 Conflict` 状态码
4. 客户端收到冲突响应后，必须强制刷新本地数据

详细 API 契约请参考：`docs/3-api_contract.md`

## 5. UI/UX 设计原则

### 5.1 "文本即棋盘"理念

将复杂的后端工作流简化为用户直观的文本编辑体验，确保每一次重要操作都能生成一个版本可控、可审计的数据构件。

### 5.2 三栏布局

- **左侧栏**：角色与导航区（可折叠的角色列表、团队空间切换器）
- **中间栏**：编辑器与列表核心工作区（TaskListView 或 TaskDetailView）
- **右侧栏**：AI 控制台与团队状态区（AI 助手控制台、团队成员状态、最近活动流）

### 5.3 核心组件

- **TaskListView**：可排序、可过滤的任务列表，支持自定义列显示
- **TaskDetailView**：集成 MyST Markdown 渲染的任务详情编辑器，支持交互式复选框等双向数据绑定

### 5.4 交互原则

- **键盘优先**：全局命令面板（Command Palette，Cmd+K）支持快速操作
- **非侵入式游戏化反馈**：XP、Gems 等奖励以内联标签形式短暂出现，避免打断用户"心流"

详细 UI/UX 规范请参考：`docs/4-ui_ux_spec.md`

## 6. 开发规范要点

### 6.1 Monorepo 结构

```
/backend    # FastAPI 后端服务，处理所有数据持久化逻辑
/frontend   # React 前端应用，负责 UI 渲染和用户交互
/cli        # 命令行工具，作为 API 的轻量级客户端
```

**重要约束**：所有业务逻辑和数据验证规则只能存在于 FastAPI 后端。CLI 工具应始终作为一个"薄客户端"，仅负责将用户命令转换为对等的 API 调用。

### 6.2 FastAPI 同步端点设计

所有处理文件 I/O 和 Git 操作的 API 端点必须使用同步的 `def` 函数定义，而非异步的 `async def`：

- 文件写入和本地 Git 命令本质上是阻塞操作
- FastAPI 会自动在专用线程池中执行同步函数，保持主事件循环的响应性

### 6.3 错误处理与回滚策略

| 失败阶段 | 回滚操作 |
|---------|---------|
| 文件写入失败 | 事务立即中止，返回 500 Internal Server Error |
| Git 提交失败 | 撤销文件系统变更，不执行数据库操作，返回 500 并记录详细日志 |
| 数据库更新失败 | 触发高优先级监控警报，返回 500 并明确指出索引可能已不同步 |

详细开发指南请参考：`docs/5-dev_guide.md`

## 7. 测试策略

### 7.1 三层测试架构

1. **单元测试**：使用 Pydantic 模型进行数据验证，确保数据类型、枚举值约束和字段必填性
2. **集成测试**：验证原子事务完整性，确保文件系统和 SQLite 索引同步更新
3. **端到端测试（E2E）**：模拟完整用户工作流，验证所有系统组件的协同工作

### 7.2 "第三重校验"核心验收标准

任何写操作的成功必须同时满足：

1. **客户端反馈正确**：API 返回预期的成功响应
2. **系统状态一致**：通过后续读操作能够查询到变更后的数据
3. **审计日志生成**：执行 `git log -- {ID}.md` 命令，断言新的、格式规范的 Git Commit 已被创建

### 7.3 性能基准

**端到端状态同步延迟**：从 CLI 执行状态变更命令到 Web UI 界面可见，最大可容忍延迟不得超过 **2秒**。

详细测试策略请参考：`docs/6-test_strategy.md`

## 8. 关键设计约束

在开发过程中，必须严格遵守以下约束：

1. **强制 role_owner 约束**：任务从 `inbox` 转为 `active` 时必须分配 `role_owner`
2. **原子性事务**：文件写入 → Git 提交 → 索引更新的严格顺序，不允许部分成功
3. **Git 提交标准化**：所有自动生成的 commit 必须遵循 `"[ACTION]: [Task Title]"` 格式
4. **后端无渲染责任**：后端仅返回原始 MyST Markdown 字符串，前端全权负责渲染
5. **CLI/API 对等**：所有业务逻辑只能存在于后端，CLI 作为薄客户端

## 9. 文档索引

- `docs/index.md`：文档导航和概览
- `docs/0-project_overview.md`：项目战略、架构与实施简报
- `docs/1-requirement.md`：产品需求文档（PRD）
- `docs/2-data_schema.md`：数据模型与指标规范
- `docs/3-api_contract.md`：API 接口契约
- `docs/4-ui_ux_spec.md`：界面与交互规范
- `docs/5-dev_guide.md`：开发指南与架构规范
- `docs/6-test_strategy.md`：测试与验收策略

---

*本文档最后更新：2025年*
