# CoreTerra 数据模型与指标规范 (data_schema.md)

## 引言：CoreTerra 混合持久化数据模型

CoreTerra 项目数据架构的核心设计哲学在于追求极致的可审计性与高性能查询能力的平衡。为此，我们选择了一种创新的混合持久化模型：将 MyST Markdown 文件作为“唯一真理源头 (Single Source of Truth, SSOT)”，同时将 SQLite 数据库作为其“可搜索元数据索引 (Searchable Metadata Index, SMI)”。

这种架构的战略优势是多维度的。首先，以人类可读的 Markdown 文件为基础，并由 Git 进行版本控制，确保了每一次任务状态的变更都拥有不可篡改的、清晰的审计日志。This architecture enhances 数据的可信度，也极大地简化了版本回溯与协作。其次，通过将关键元数据镜像到高性能的 SQLite 索引中，系统能够提供瞬时的任务过滤、排序和聚合视图，避免了直接查询和解析大量文本文件所带来的性能瓶颈。

正如 MVP Implementation Blueprint 所规划的，此模型为未来的 AI 功能（如流程挖掘和智能预测）奠定了坚实、可信的数据基础。一个结构化、版本化的数据集是训练可靠 AI 模型的先决条件。通过确保数据源头的纯粹性与可追溯性，我们为 LLM 提供了高质量的上下文，从而能够进行更深层次的洞察。

This document defines the four core components of this architecture:

1. Frontmatter 字段：定义任务元数据的标准结构。
2. 索引映射：阐明元数据如何映射到高性能数据库表。
3. 关键绩效指标算法：规范化核心生产力指标的计算方式。
4. AI 数据契约：为未来的流程挖掘奠定事件日志基础。

---

## 1. Frontmatter 核心字段定义 (YAML)

将 MyST Markdown 的 Frontmatter (以 YAML 格式定义) 作为“唯一真理源头 (SSOT)”是 CoreTerra 数据战略的基石。我们将所有任务的核心元数据严格定义在每个文件的头部，这一决策至关重要。它不仅保证了跨系统的数据一致性与可移植性，更为关键的是，它为未来 AI 模型的数据摄取提供了一个清晰、稳定且语义丰富的结构化接口。这种对 schema 的严格约束旨在预防因非结构化或模棱两可的 API 响应而导致的 AI 应用失败，确保无论后端技术如何演进，数据的核心价值始终得以保留和理解。

以下表格严格定义了 CoreTerra 任务的 Frontmatter schema。

字段名称	数据类型	约束/格式	描述	AI 相关性
ct_id	String	UUID v4	全局唯一标识符 (UUID)，用于精确关联文件与索引记录，是流程挖掘中的 case_id。	为 LLM 提供了稳定的实体标识，确保跨不同上下文和时间点分析同一任务的一致性。
status	Enum	inbox | active | completed | archived	任务的当前生命周期状态。此状态机是我们工作流的基础，反映了任务管理最佳实践中类似看板的阶段。	结构化的状态流是流程挖掘的基础，使 AI 能够识别状态转换模式、瓶颈和异常。
priority	Integer	1-5	任务的优先级，5 为最高。用于排序和工作 triage。	为 AI 提供了量化的重要性信号，可用于预测任务延期风险或推荐优先处理项。
role_owner	String	Kebab-case string (e.g., 'backend-engineer')	任务的责任角色。基于角色的分配比分配到具体个人更具扩展性和灵活性。	帮助 AI 理解组织内的责任流转模式，可用于分析不同角色的工作负载和效率。
parent_id	String	UUID v4 (可为空)	父任务的 ct_id。如果设置，此任务是父任务的子任务。子任务是独立的任务实体，拥有完整的元数据和生命周期。	使 AI 能够理解任务的层级关系，支持工作分解结构（WBS）分析和依赖关系推理。
timestamp_capture	DateTime	ISO 8601	任务被"捕获"或创建的精确时间点，标志着一个想法或需求的正式记录。	定义了任务生命周期的起点，是计算规划延迟和整体周期的关键时间戳。
timestamp_commitment	DateTime	ISO 8601	任务被正式"承诺"执行的时间点，例如状态从 inbox 变为 active。	衡量从认知到行动的转化效率。AI 可分析此延迟，识别决策瓶颈。
timestamp_completion	DateTime	ISO 8601	任务状态首次变更为 completed 的精确时间点。	这是计算交付可靠性的核心数据点，使 AI 能够精确评估承诺的兑现情况。
due_date	Date	ISO 8601 (YYYY-MM-DD) (可为空)	承诺完成的目标日期。这是衡量承诺准确率的基准。	为 AI 提供了明确的预期目标，是训练预测模型和评估执行偏差的关键特征。

这些在文件中定义的结构化字段，将通过一个自动化的同步流程被精确映射到高性能的元数据索引中，以支持复杂查询。

---

## 2. 索引映射：SQLite tasks 表结构

虽然将 Markdown 文件作为真理源头保证了数据的可审计性，但直接在成百上千个独立文件上执行过滤、排序和聚合操作会遭遇严重的性能瓶颈。为了提供流畅、响应迅速的用户体验，我们必须建立一个“可搜索元数据索引 (SMI)”。SQLite 因其轻量、高效和内嵌式的特性，成为此角色的理想选择。该索引表精确镜像了 Frontmatter 中的关键字段，将耗时的文件 I/O 和文本解析操作转化为高速的结构化查询。虽然此方法引入了数据冗余，但这一成本因查询延迟的显著降低以及对主数据源免受分析工作负载压力的保护而完全合理，这也是可扩展数据设计的关键原则。For optimal query performance, indexes must be created on the status, priority, role_owner, due_date, timestamp_capture, timestamp_commitment, and timestamp_completion columns.

以下是 SQLite 中 tasks 表的详细结构定义。

列名	SQLite 数据类型	约束	映射源 (Frontmatter 字段)
ct_id	TEXT	PRIMARY KEY	ct_id
status	TEXT		status
priority	INTEGER		priority
role_owner	TEXT		role_owner
parent_id	TEXT	FOREIGN KEY REFERENCES tasks(ct_id)	parent_id
timestamp_capture	TEXT		timestamp_capture
timestamp_commitment	TEXT		timestamp_commitment
timestamp_completion	TEXT		timestamp_completion
due_date	TEXT		due_date

Note: All date and time fields are stored as TEXT and must strictly adhere to the ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ) at the application layer to ensure data integrity and correct chronological sorting.

有了精确定义的数据模型和高性能索引，我们现在可以基于这些结构化的时间戳数据，构建一套标准化的核心性能衡量指标。

---

## 3. 核心指标算法：PQI 与 CAR 公式

定义标准化的性能指标，其战略目的在于将原始的任务元数据转化为可量化、可行动的洞察。规划质量指数 (PQI) 和承诺准确率 (CAR) 是我们衡量团队效能的两个核心支柱。这些指标创建了一个共享的、客观的绩效语言，将讨论从轶事驱动转向数据驱动。它们分别用于评估从需求捕获到承诺执行的规划效率，以及从承诺到交付的执行可靠性。这套指标不仅为团队提供了持续改进的客观依据，也为未来 AI 进行流程优化和绩效预测提供了关键的基准数据。

### 3.1 规划质量指数 (Planning Quality Index, PQI)

1. **定义与目的**: PQI 是一个衡量从任务被捕获到团队正式承诺执行之间时间效率的指标。较低的 PQI 值（即更短的时间差）直接反映了更高效的规划流程、更少的决策积压和更敏捷的需求响应能力。
2. **计算公式**: 该指标通过计算两个关键时间戳的差值得出。

   ```
   PQI = timestamp_commitment - timestamp_capture
   ```

3. **解读**: PQI 的结果通常以小时或天为单位。团队可以通过监控 PQI 的趋势来识别规划或决策流程中的瓶颈。例如，持续升高的 PQI 可能表明任务在"收件箱"中停留时间过长，需要优化任务分配或评审流程。

### 3.2 承诺准确率 (Commitment Accuracy Rate, CAR)

1. **定义与目的**: CAR 是一个衡量任务是否在其承诺的截止日期 (due_date) 内完成的核心指标。它直接反映了团队交付的可靠性和可预测性，是评估执行纪律性的关键。
2. **计算公式**: 对于单个任务，CAR 是一个二元函数：如果任务按时或提前完成，则为 1；如果逾期，则为 0。

   ```
   CAR(task) = {
     1, if timestamp_completion <= due_date
     0, if timestamp_completion > due_date
   }
   ```

3. **解读**: 在团队或项目层面，CAR 通常以百分比形式呈现（例如，计算一个季度内所有已完成任务的 CAR 平均值）。一个高水平的 CAR（如 >90%）表明团队能够可靠地兑现其承诺，这对于建立内外部信任至关重要。持续高于 90% 的 CAR 是交付节奏可预测且值得信赖的直接指标，这对维系利益相关者的信心至关重要。

除了衡量当前绩效，数据结构的设计还必须为未来的 AI 驱动的流程挖掘提供前瞻性支持。

---

## 4. AI 数据契约：Event Log 结构定义

定义一个清晰的“AI 数据契约”是 CoreTerra 架构最具前瞻性的部分。一个结构良好、语义清晰的事件日志 (Event Log) 是未来驱动高级 AI 功能的基石。借鉴流程挖掘领域的最佳实践，我们设计的事件日志旨在确保任何大语言模型 (LLM) 都能毫不费力地解析任务生命周期中的每一次状态变更。这个标准化的数据流将成为未来进行自动化流程发现、根本原因分析、异常检测和行为预测等智能应用的“燃料”。

以下表格定义了 event_log 的标准结构，确保每一次变更都可被 AI 精确理解和利用。

字段名称	数据类型	描述	示例
event_id	String	全局唯一的事件标识符，确保每个事件的可追溯性。	e7a7f3e2-1b1a-4e2a-8c6c-2f9a1b9e0a0f
case_id	String	关联到任务的 ct_id，作为流程挖掘中的核心“案例 ID”，串联起单个任务的所有事件。	d1b2c3a4-1234-5678-90ab-cdef12345678
activity_name	String	描述所发生的具体活动。这种严格的 Verb Noun 命名规范，正如流程挖掘最佳实践 (Designing an event log - Process Mining)所建议的，为自动化分析提供了明确的语义。	Create Task, Update Status, Change Priority
timestamp	DateTime	事件发生时的精确时间戳 (ISO 8601 格式)，为时序分析提供基础。	2025-11-10T14:30:00Z
role_owner	String	执行该活动的角色，用于分析不同角色的行为模式。	backend-engineer
event_details	JSON/Text	存储与事件相关的附加上下文信息，如状态变更前后的值，为 AI 提供更丰富的分析维度。	{'field': 'status', 'old': 'inbox', 'new': 'active'}

本规范定义了一个完整的数据生命周期：原子级的真理在 Frontmatter 中被捕获，通过 SMI 进行高速查询，利用我们的核心指标进行绩效衡量，并为未来的智能分析记录在 AI 数据契约中。这种集成架构确保我们的运营数据不仅仅是被动存储，而是一个被主动管理的、智能化的资产。
