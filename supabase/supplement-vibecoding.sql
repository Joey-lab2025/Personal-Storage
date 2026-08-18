-- 在已执行 resume-schema.sql 的 job-agent 项目中单独运行本文件。
-- 使用标题/分类检查，重复执行不会反复插入相同资料。

insert into projects (
  title_cn, title_en, role, project_type, description,
  highlights, skills, url, sort_order, is_resume_default
)
select
  'Vibe Coding 数字产品实践',
  'Vibe Coding Digital Product Practice',
  '独立开发者',
  '数字产品 / AI 辅助开发',
  '利用 Vibe Coding 工作流将个人需求转化为可运行的数字产品，覆盖网站、互动应用与内容生产工具。',
  '["完成个人作品集网站的设计与开发","完成 2D 小游戏开发","完成微信公众号模板自动化排版工具"]'::jsonb,
  '["Vibe Coding","AI 辅助开发","Web 开发","产品原型","工作流自动化"]'::jsonb,
  'https://portfolio-joey-liard.vercel.app/',
  5,
  true
where not exists (
  select 1 from projects where title_cn = 'Vibe Coding 数字产品实践'
);

insert into skills (category, name, level, sort_order)
select item.category, item.name, item.level, item.sort_order
from (values
  ('AI Tools', '大语言模型辅助编程 · Prompt 设计 · API 调用', '项目实践', 6),
  ('Programming', 'Vibe Coding · Web 开发 · 自动化工作流', '项目实践', 7),
  ('Computer Vision', 'GroundingDINO · X-AnyLabeling · NightCity 语义分割', '研究实践', 8)
) as item(category, name, level, sort_order)
where not exists (
  select 1 from skills where skills.category = item.category and skills.name = item.name
);
