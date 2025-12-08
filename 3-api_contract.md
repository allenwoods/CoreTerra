# CoreTerra API 接口契约 (v1.0)

## 1.0 介绍与核心设计理念

本文档旨在为 CoreTerra 项目确立一套标准化的前后端交互契约，确保系统各组件间的通信高效、可靠且可预测。

CoreTerra 的核心架构服务于一个独特的混合持久化模型：以 Git 审计的 MyST Markdown 文件作为系统的唯一真实数据源（Source of Truth），并辅以 SQLite 数据库作为元数据的高性能搜索索引。

我们选择此架构旨在实现以下战略目标：

* 完全的可审计性：每一次数据变更都对应一次不可篡改的 Git 提交，为系统提供完整的历史追溯能力。
* 卓越的数据可移植性：所有核心数据均为人类可读的 Markdown 文件，不依赖任何专有数据库格式，确保长期可用性。
* 面向未来的 AI 功能：结构化的元数据（YAML frontmatter）与完整的变更历史为未来引入机器学习和大型语言模型（LLM）功能奠定了坚实、可信的数据基础。

以下表格总结了本文档所遵循的核心设计原则：

原则 (Principle)	描述 (Description)	战略重要性 (Strategic Importance)
后端责任分离	后端仅负责文件 I/O、Git 事务和索引更新，严禁进行任何 Markdown 到 HTML 的渲染。	保持后端无状态和高性能，将渲染逻辑完全委托给前端，实现关注点分离。
原子化写入	所有创建、更新或归档操作都必须作为一个不可分割的原子事务执行，确保文件写入、Git 提交和 SQLite 索引更新同时成功或全部回滚。	保证数据在文件系统、版本历史和搜索索引三个层面上的绝对一致性，从根本上杜绝数据损坏。
Git 作为审计日志	每一次状态变更都必须对应一次独立的 Git 提交，提交信息需遵循标准化格式。	提供不可篡改的、精确到每一次变更的任务历史记录，为未来的流程挖掘和 AI 模型训练建立可信的数据血统。

The following Pydantic schemas formalize the data structures that underpin these principles, serving as the canonical data contract for all API interactions.

## 2.0 数据模型 (Pydantic Schemas)

本章节使用 Pydantic 模型来精确定义所有 API 请求和响应的数据结构。这些模型不仅确保了严格的类型安全和自动化的数据校验，更重要的是，它们直接映射到 MyST Markdown 文件的 YAML frontmatter 和文件体内容，构成了数据持久化层与应用逻辑层之间的桥梁。

```python
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class TaskMetadataBase(BaseModel):
    """任务元数据的基本模型，映射到 MyST 文件的 frontmatter。"""
    title: str
    status: str
    priority: int = Field(..., ge=1, le=5)  # 优先级范围 1 (低) 到 5 (紧急)
    user_id: str
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    parent_id: Optional[str] = None

class TaskMetadataResponse(TaskMetadataBase):
    """包含系统生成元数据的任务响应模型。"""
    id: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

class TaskFullResponse(TaskMetadataResponse):
    """包含任务完整内容的响应模型，用于获取单个任务详情。"""
    body: str  # Raw MyST Markdown string, NOT HTML

class TaskCreateRequest(BaseModel):
    """创建新任务的请求模型。"""
    title: str
    user_id: str
    priority: Optional[int] = Field(3, ge=1, le=5)
    tags: Optional[List[str]] = None
    body: Optional[str] = ""

class TaskStatusUpdateRequest(BaseModel):
    """更新任务状态的专用请求模型。"""
    status: str
    user_id: str
    updated_at: datetime  # For optimistic locking

class TaskMetadataPatchRequest(BaseModel):
    """局部更新任务元数据的请求模型，所有字段均为可选。"""
    priority: Optional[int] = Field(None, ge=1, le=5)
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    updated_at: datetime  # Required for optimistic locking
```

These models form the strict schema for the API endpoints detailed in the next section, ensuring type safety and validation at the application boundary.

## 3.0 端点定义 (API Endpoints)

本节将详细描述 CoreTerra 后端提供的所有 RESTful API 端点。请注意，所有写入操作（POST, PUT, PATCH）都严格遵循前文所述的原子事务原则，以确保数据的一致性和完整性。

### 3.1 创建任务 (Create Task)

- **方法与路径**: `POST /tasks/`
- **描述**: 创建一个新任务。此操作是原子的，会同步触发文件系统写入、Git 提交和 SQLite 索引更新。
- **请求体 (Request Body)**: `TaskCreateRequest`
- **成功响应 (Success Response)**:
  - **状态码**: `201 Created`
  - **响应体**: `TaskMetadataResponse` 对象，包含新生成的 id 和各项时间戳。

### 3.2 检索任务详情 (Retrieve Task)

- **方法与路径**: `GET /tasks/{task_id}`
- **描述**: 根据任务 ID 获取其完整的元数据和原始内容。
- **路径参数 (Path Parameters)**: `task_id` (str)
- **成功响应 (Success Response)**:
  - **状态码**: `200 OK`
  - **响应体**: `TaskFullResponse` 对象。
  - **重要说明**: 响应体中的 `body` 字段是 **原始的 MyST Markdown 字符串**。前端客户端全权负责其解析和渲染，后端不承担任何渲染责任。
- **错误响应 (Error Response)**:
  - **状态码**: `404 Not Found`

### 3.3 查询任务列表 (List Tasks)

- **方法与路径**: `GET /tasks/`
- **描述**: 查询任务列表，支持多种过滤和排序条件。为优化性能，此端点仅返回元数据，不包含任务的 body 内容。All queries are executed against the performant SQLite index to ensure low-latency responses, typically in the millisecond range.
- **查询参数 (Query Parameters)**:

| 参数 (Parameter) | 类型 (Type) | 描述 (Description) |
|-----------------|------------|-------------------|
| status | str | 按任务状态过滤 (e.g., 'active', 'completed')。 |
| priority | int | 按优先级过滤 (1-5)。 |
| tag | str | 按单个标签过滤。 |
| sort_by | str | 指定排序字段 (e.g., 'created_at', 'priority')。 |
| limit | int | 限制返回结果的数量，默认为 50。 |

- **成功响应 (Success Response)**:
  - **状态码**: `200 OK`
  - **响应体**: `List[TaskMetadataResponse]` 对象数组。

### 3.4 更新任务状态 (Update Status)

- **方法与路径**: `PUT /tasks/{task_id}/status`
- **描述**: 更新指定任务的状态（例如，从 'active' 到 'completed'）。这是一个受并发控制保护的原子写入操作。
- **路径参数 (Path Parameters)**: `task_id` (str)
- **请求体 (Request Body)**: `TaskStatusUpdateRequest`
- **成功响应 (Success Response)**:
  - **状态码**: `200 OK`
  - **响应体**: 更新后的 `TaskMetadataResponse` 对象。
- **错误响应 (Error Response)**:
  - **状态码**: `404 Not Found`, `409 Conflict` (详见并发控制部分)。

### 3.5 修改任务元数据 (Modify Metadata)

- **方法与路径**: `PATCH /tasks/{task_id}`
- **描述**: 局部修改任务的元数据，如优先级、标签或截止日期。这是一个受并发控制保护的原子写入操作。
- **路径参数 (Path Parameters)**: `task_id` (str)
- **请求体 (Request Body)**: `TaskMetadataPatchRequest`
- **成功响应 (Success Response)**:
  - **状态码**: `200 OK`
  - **响应体**: 更新后的 `TaskMetadataResponse` 对象。
- **错误响应 (Error Response)**:
  - **状态码**: `404 Not Found`, `409 Conflict` (详见并发控制部分)。

为了处理可能由 UI 和 CLI 同时操作引发的竞态条件，我们引入了乐观锁机制。

## 4.0 并发控制：乐观锁机制

为防止因并发写入导致的数据覆盖（“最后写入者获胜”）和审计历史记录损坏，系统必须实现乐观锁机制。这在 UI 和 CLI 可能同时操作同一任务的场景下尤为关键。

该机制的工作流程如下：

1. 客户端获取数据与版本戳 客户端（前端或 CLI）在加载任务进行编辑时，会从 API 收到包含 updated_at 时间戳的 TaskMetadataResponse 对象。此时间戳代表了该任务数据的当前版本。
2. 客户端提交变更与版本戳 当用户执行更新操作（PUT 或 PATCH）时，the request body must include the updated_at timestamp it received when the data was last fetched. This timestamp serves as the version token.
3. 后端校验版本 后端在执行任何文件或数据库写入之前，首先从 SQLite 索引中读取目标任务当前的 updated_at 值。
4. 比较时间戳 后端将客户端提交的 updated_at 时间戳与数据库中存储的当前值进行严格比较。
5. 处理成功（版本匹配） 如果两个时间戳完全匹配，则证明在用户编辑期间没有发生并发修改。后端将继续执行原子写入操作（更新文件、提交 Git、更新索引），并在事务成功后返回 200 OK 状态码及更新后的任务对象（包含一个新的、更晚的 updated_at 时间戳）。
6. 处理冲突（版本不匹配） 如果数据库中的时间戳比客户端提交的时间戳要新，则说明在用户编辑期间已有另一次更新被成功提交。后端将立即中止操作，不执行任何写入，并返回 409 Conflict 状态码。

乐观锁机制是保证数据完整性和 Git 历史纯洁性的核心防线。客户端在收到 409 Conflict 响应后，必须强制刷新本地数据，并提示用户其本地版本已过期，需要基于最新数据重新进行修改以解决冲突。

## 5.0 附录：Git 提交信息规范

为确保 Git 历史记录作为可机读审计日志的长期价值，所有由 API 自动触发的 commit 都必须遵循以下标准化格式。

操作 (Operation)	提交信息格式 (Commit Message Format)
创建任务	ADD: {Task Title}
完成任务	COMPLETE: {Task Title}
开始任务	START: {Task Title}
更新元数据	UPDATE: {Task Title}
归档任务	ARCHIVE: {Task Title}

这种严格格式化的历史记录，使得未来能够通过简单的 git log 分析来精确计算任务处理周期、状态停留时长等关键性能指标，为流程优化和 AI 模型训练提供数据支持。
