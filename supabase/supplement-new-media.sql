-- 来源：原个人网站公开项目数据及 cv.pptx / cv-教职.pptx
-- 在 job-agent 的 Supabase SQL Editor 中执行；可重复执行。
begin;

insert into projects (
  title_cn, title_en, role, start_date, end_date, project_type,
  description, highlights, skills, url, sort_order, is_resume_default
)
select
  '跨平台新媒体运营与内容创作',
  'Cross-platform New Media Operations & Content Creation',
  '新媒体编辑 / 独立内容创作者',
  '2019-01-01',
  null,
  '新媒体运营',
  '围绕风景园林、建筑与城市文化开展跨平台内容策划与传播，覆盖微信公众号、小红书、B站视频及学术直播，具备从选题、资料研究、图文编辑、视觉排版、拍摄剪辑到发布运营的完整内容生产能力。',
  '["《广东园林》微信公众号：负责内容运营、文章编排与视觉设计，提升 2000+ 粉丝；参与 20+ 场学术沙龙直播，单场最高观看人数约 3000","LandAspresso 小红书：以图文形式介绍国内外景观与建筑案例，探索专业知识的轻量化表达","B站建筑影像：完成美秀美术馆、冈山 J Terrace 咖啡馆等建筑空间视频，通过拍摄与剪辑呈现沉浸式场所体验","万殊趣舍微信公众号：创作游记以及景观、建筑师介绍内容","形成公众号图文、小红书内容、B站视频和直播活动相结合的跨平台传播经验"]'::jsonb,
  '["微信公众号运营","小红书内容创作","B站视频","选题策划","图文编辑","视觉排版","摄影摄像","视频剪辑","直播执行","数据复盘"]'::jsonb,
  'https://portfolio-joey-liard.vercel.app/',
  6,
  true
where not exists (
  select 1 from projects where title_cn = '跨平台新媒体运营与内容创作'
);

update projects set
  role = '新媒体编辑 / 独立内容创作者',
  project_type = '新媒体运营',
  description = '围绕风景园林、建筑与城市文化开展跨平台内容策划与传播，覆盖微信公众号、小红书、B站视频及学术直播，具备从选题、资料研究、图文编辑、视觉排版、拍摄剪辑到发布运营的完整内容生产能力。',
  highlights = '["《广东园林》微信公众号：负责内容运营、文章编排与视觉设计，提升 2000+ 粉丝；参与 20+ 场学术沙龙直播，单场最高观看人数约 3000","LandAspresso 小红书：以图文形式介绍国内外景观与建筑案例，探索专业知识的轻量化表达","B站建筑影像：完成美秀美术馆、冈山 J Terrace 咖啡馆等建筑空间视频，通过拍摄与剪辑呈现沉浸式场所体验","万殊趣舍微信公众号：创作游记以及景观、建筑师介绍内容","形成公众号图文、小红书内容、B站视频和直播活动相结合的跨平台传播经验"]'::jsonb,
  skills = '["微信公众号运营","小红书内容创作","B站视频","选题策划","图文编辑","视觉排版","摄影摄像","视频剪辑","直播执行","数据复盘"]'::jsonb,
  url = 'https://portfolio-joey-liard.vercel.app/',
  is_resume_default = true
where title_cn = '跨平台新媒体运营与内容创作';

insert into skills(category, name, level, sort_order, is_resume_default)
select
  'New Media',
  '微信公众号运营 · 小红书图文 · B站视频 · 学术直播 · 跨平台内容策划',
  '独立创作与项目实践',
  9,
  true
where not exists (
  select 1 from skills where category = 'New Media'
);

update skills set
  name = '微信公众号运营 · 小红书图文 · B站视频 · 学术直播 · 跨平台内容策划',
  level = '独立创作与项目实践',
  is_resume_default = true
where category = 'New Media';

commit;
