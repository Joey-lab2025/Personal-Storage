# Job Agent

Next.js 16 + Supabase 的个人资料库、JD 分析、岗位匹配与一岗一简历系统。

## 启动

```powershell
npm install
npm run dev
```

首次启用第二阶段时，在 Supabase SQL Editor 执行 `supabase/phase2-jobs.sql`。

## 环境变量

复制 `.env.example` 为 `.env.local`。`DEEPSEEK_API_KEY` 仅在服务端使用，不得添加 `NEXT_PUBLIC_` 前缀。配置后使用 DeepSeek Chat Completions JSON Output；未配置时仍可使用确定性 JD 解析、加权匹配和事实原文简历流程。

## 主要入口

## 第三阶段：BOSS 辅助采集

先在 Supabase SQL Editor 执行 `supabase/phase3-job-import.sql`，再在 `.env.local` 配置：

```env
JOB_IMPORT_TOKEN=一段足够长的随机字符串
SUPABASE_SERVICE_ROLE_KEY=Supabase 服务端 secret/service role key
```

`SUPABASE_SERVICE_ROLE_KEY` 只存在于 Job Agent 服务端，绝不能放进扩展。扩展只保存 `JOB_IMPORT_TOKEN`，并仅把用户当前打开的 BOSS 岗位发送到 `/api/jobs/import`。

### 扩展构建与安装

```powershell
cd job-agent-extension
npm install
npm run build
```

打开 `chrome://extensions`，启用 Developer mode，选择 Load unpacked，加载 `job-agent-extension/dist`。首次打开扩展时填写 Job Agent URL（本地通常为 `http://localhost:3000`）和 `JOB_IMPORT_TOKEN`。

### 导入流程

`Validate → Normalize → SHA-256 Fingerprint → Deduplicate → Insert/Update → analyzeJob() → matchJob() → Hard Filter Penalty → Category`

去重优先使用 `source_job_id`，其次使用清理后的 `source_url`，最后使用“公司 + 岗位 + 地点”。重复岗位只更新 `last_seen_at`；JD 变化时更新 `job_description_updated_at` 并重新分析。

分类阈值集中在 `config/jobMatching.ts`：85+ Priority、75–84 Recommended、65–74 Consider、0–64 Skip；用户偏好可在 `/settings/jobs` 覆盖自动优先和跳过阈值。硬筛选只产生警告和分数惩罚，不删除岗位。

### BOSS 解析与 fallback

解析器依次采用稳定选择器、文本标签、DOM/metadata fallback，并为核心字段计算置信度。置信度较低时弹窗提示确认，用户可以直接编辑公司、岗位、地点、薪资和 JD。无法识别时仍保留 `/jobs/new` 手动导入入口。

手动测试应覆盖：正常/超长/极短 JD，缺少薪资、学历或公司信息，页面结构无法识别，重复岗位，同公司同岗位不同地点，以及重复岗位 JD 更新。

本阶段不包含自动投递、自动打招呼、自动聊天、自动登录、验证码处理或批量抓取。下一阶段若接入投递辅助，应继续保持用户逐岗位确认，并将投递状态和时间写回现有 `jobs` 记录。

## 每日 BOSS 候选 Top 10

执行 `supabase/phase4-daily-candidates.sql` 后，扩展会在用户正常打开和滚动 BOSS 搜索结果页时读取当前可见岗位卡片。它不会自动搜索、翻页或在浏览器关闭后运行。候选通过 `/api/jobs/candidates` 按目标岗位、城市、关注/排除关键词、公司黑名单和最低薪资进行快速评分；系统每天动态标记分数最高的 10 条，可在 `/jobs/candidates` 查看。候选卡片不等同于完整 JD 分析，打开岗位详情并再次使用扩展后才会进入正式 jobs、DeepSeek JD 分析和简历生成流程。

转专业简历生成会向 DeepSeek 提供完整教育、技能、论文、奖项及已选择经历，以 4–6 句职业摘要和每段 3–5 个分点构建一致的可迁移能力叙事，同时继续执行 record_id 和原文一致性校验，禁止虚构事实。

- `/`：Dashboard
- `/admin`：Master Profile
- `/jobs`、`/jobs/new`、`/jobs/[id]`：岗位与匹配分析
- `/resumes`、`/resumes/[id]`：一岗一简历与改写对比
- `/resume`：基础简历

## SQL

- `resume-schema.sql`：第一阶段表结构与初始资料
- `phase2-jobs.sql`：Jobs 及 Resume Version 关联
- `avatar-storage.sql`：头像 Storage
- 其他 `supplement-*`、`enrich-*`：资料增量脚本
