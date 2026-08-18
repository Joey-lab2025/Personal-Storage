-- Personal resume database. Run once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists profile (
 id uuid primary key default gen_random_uuid(), name_cn text not null default '', name_en text not null default '',
 job_title text not null default '', phone text not null default '', email text not null default '', city text not null default '',
 website text not null default '', github text not null default '', linkedin text not null default '', summary text not null default '',
 avatar_url text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists education (id uuid primary key default gen_random_uuid(), school text not null, degree text, major text, start_date date, end_date date, gpa text, description text, sort_order int not null default 0, is_resume_default boolean not null default true);
create table if not exists experiences (id uuid primary key default gen_random_uuid(), company text not null, department text, position text, location text, start_date date, end_date date, description jsonb not null default '[]', tags jsonb not null default '[]', sort_order int not null default 0, is_resume_default boolean not null default true);
create table if not exists projects (id uuid primary key default gen_random_uuid(), title_cn text not null, title_en text, role text, start_date date, end_date date, project_type text, description text, highlights jsonb not null default '[]', skills jsonb not null default '[]', url text, sort_order int not null default 0, is_resume_default boolean not null default true);
create table if not exists research (id uuid primary key default gen_random_uuid(), title text not null, research_type text, role text, start_date date, end_date date, description text, methods text, dataset text, results text, url text, sort_order int not null default 0, is_resume_default boolean not null default true);
create table if not exists publications (id uuid primary key default gen_random_uuid(), title text not null, journal text, authors text, publication_date date, status text check(status in ('已发表','已录用','投稿中','工作论文')), doi text, url text, sort_order int not null default 0, is_resume_default boolean not null default true);
create table if not exists skills (id uuid primary key default gen_random_uuid(), category text not null, name text not null, level text, sort_order int not null default 0, is_resume_default boolean not null default true);
create table if not exists awards (id uuid primary key default gen_random_uuid(), title text not null, organization text, award_date date, description text, sort_order int not null default 0, is_resume_default boolean not null default true);
create table if not exists resume_versions (id uuid primary key default gen_random_uuid(), name text not null, target_job text, target_company text, content jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());

alter table profile enable row level security; alter table education enable row level security; alter table experiences enable row level security; alter table projects enable row level security; alter table research enable row level security; alter table publications enable row level security; alter table skills enable row level security; alter table awards enable row level security; alter table resume_versions enable row level security;
do $$ declare t text; begin foreach t in array array['profile','education','experiences','projects','research','publications','skills','awards'] loop execute format('create policy "public read %1$s" on %1$I for select using (true)',t); execute format('create policy "authenticated write %1$s" on %1$I for all to authenticated using (true) with check (true)',t); end loop; end $$;
create policy "authenticated versions" on resume_versions for all to authenticated using (true) with check (true);

insert into profile (name_cn,name_en,job_title,phone,email,city,website,summary) select '刘康','JOEY LIU','城市数据科学 · AI 城市感知 · 健康城市设计','+86 13924085736','zcliukeer@163.com','广州','https://portfolio-joey-liard.vercel.app/','风景园林背景的跨学科研究与设计实践者，关注城市数据科学、人工智能与健康城市设计，具有研究、内容传播及项目落地经验。' where not exists(select 1 from profile);
insert into education(school,degree,major,start_date,end_date,gpa,sort_order) values
('华南农业大学（双一流）','硕士','风景园林','2022-09-01','2025-12-01','3.66/4',0),('华南农业大学（双一流）','学士','风景园林','2017-09-01','2021-06-01','3.67/4',1) on conflict do nothing;
insert into experiences(company,position,location,start_date,end_date,description,sort_order) values
('《广东园林》','新媒体编辑（兼职）','广州，广东','2024-03-01',null,'["负责公众号内容运营与编排，提升 2000+ 粉丝","参与 19+ 场学术沙龙直播与学术会议传播"]',0),
('深圳市有方空间文化发展有限公司','新媒体编辑','深圳，广东','2022-02-01','2022-05-01','["负责公众号日常运营及编排","参与建筑师与景观设计师“名师系列”内容传播"]',1),
('AECOM 广州','景观设计师助理（实习）','广州，广东','2021-05-01','2021-08-01','["参与深圳美谷、云溪花园及城市道路提升等项目","负责方案设计、建模与渲染支持"]',2) on conflict do nothing;
insert into research(title,research_type,role,start_date,end_date,description,methods,dataset,results,sort_order) values
('社会网络分析视角下西方现代风景园林知识图谱构建研究','毕业研究','负责人','2023-09-01','2025-05-01','以 186 万字语料构建西方现代风景园林理论知识图谱。','OCR、实体与关系抽取、大模型 Prompt、Gephi 社会网络分析','186 万字语料；1822 个实体','搭建可视化在线交互网络平台，实现信息展示与实时查询。',0),
('社交媒体数据与计算视觉技术在景观审美变迁中研究应用','数据驱动研究','负责人','2024-03-01','2025-03-01','研究改革开放以来中国大众景观审美变迁及驱动因素。','GroundingDINO 辅助标注、目标检测、政策文本分析','29,238 张图片；5,000 张训练图；1,571 份政策文本','训练 37 类景观要素检测模型。',1),
('基于大数据的城市夜间可跑性评价模型与策略','国际竞赛研究','核心成员','2022-11-01','2023-04-01','评估街道环境对夜跑者感知的影响。','NightCity 语义分割、人机对抗评分、GWR','19,943 张夜间街景；6 类感知与 8 类环境指标','形成夜跑友好街道设计工具包，获 IFLA 亚太区荣誉奖。',2) on conflict do nothing;
insert into projects(title_cn,title_en,role,start_date,end_date,project_type,description,highlights,sort_order) values
('园林园艺健康景观设计指导手册','Guidance for Designing Healing Gardens','负责人','2021-05-01','2022-05-01','校企合作','构建面向公共空间与社区场景的健康花园产品体系。','["完成 4 个系列、83 个花园模块与 4 个示例场景","形成 101 页设计指导手册"]',0),
('草云间——疗愈花园设计与落地','Practice of Healing Garden','负责人','2022-10-01','2023-05-01','建成项目','将健康花园手册转化为可体验的落地示例。','["负责方案、施工、价目表与后期跟进","项目获《风景园林》报道并组织 30+ 人体验活动"]',1),
('芳香协奏曲——园林芳香植物实训工坊','Aromatic Concerto','负责人','2023-05-01','2023-07-01','建成项目','以交响曲概念串联芳香植物观赏、栽植与教学功能。','[]',2),
('华南农业大学兽医学院周边环境提升','Enhancement of the Surrounding Environment of the College of Veterinary Medicine','负责人','2024-05-01','2024-07-01','校园改造','校园周边空间升级改造与方案设计。','[]',3),
('2024 年风景园林毕业展览','2024 Landscape Architecture Graduation Exhibition','负责人','2024-03-01','2024-06-01','活动策划','以“戏”为主题策划户外展览、市集与分享活动。','["线下参与 1000+ 人次、市集摊位 30+","发布 23 篇系列推文，总浏览量 6000+"]',4) on conflict do nothing;
-- 数字产品实践：来源于个人资料 new.txt，仅记录已经完成的事实。
insert into projects(title_cn,title_en,role,project_type,description,highlights,skills,url,sort_order,is_resume_default) values
('Vibe Coding 数字产品实践','Vibe Coding Digital Product Practice','独立开发者','数字产品 / AI 辅助开发','利用 Vibe Coding 工作流将个人需求转化为可运行的数字产品，覆盖网站、互动应用与内容生产工具。','["完成个人作品集网站的设计与开发","完成 2D 小游戏开发","完成微信公众号模板自动化排版工具"]','["Vibe Coding","AI 辅助开发","Web 开发","产品原型","工作流自动化"]','https://portfolio-joey-liard.vercel.app/',5,true) on conflict do nothing;
insert into publications(title,journal,authors,publication_date,status,sort_order) values
('社交媒体中风景园林形象的错位与重构——以知乎、小红书为例','南方建筑（CSSCI、北大核心）','刘康，陈崇贤，李璐瑶','2025-07-01','已发表',0),
('风景园林理论知识体系发展溯源','风景园林（北大核心）','陈崇贤，刘康，刘京一','2024-03-01','已发表',1),
('国内风景园林学术研究合作网络特征分析','广东园林','刘康，陈崇贤','2024-01-01','已发表',2),
('澳门药用植物资源','广东园林','方惠婷，刘康，秦新生','2021-01-01','已发表',3) on conflict do nothing;
insert into awards(title,organization,award_date,description,sort_order) values
('学生类研究类荣誉奖','ASLA','2023-01-01','Toward Dynamic Optimization: Combining AI and EBHDL for the Elderly',0),
('亚太区风景园林奖荣誉奖','IFLA','2023-01-01','Weaving the Streets: A Vision for Promoting Night Running in Guangzhou',1),
('国际花园建造节设计三等奖、建造二等奖','北京林业大学','2020-01-01','',2) on conflict do nothing;
insert into skills(category,name,sort_order) values
('Data','Python · SPSS · R · Gephi',0),('AI','Prompt 设计 · API 调用 · GroundingDINO',1),('Design','Photoshop · Illustrator · InDesign · Lightroom',2),('Modeling','AutoCAD · SketchUp · Rhino/Grasshopper · Lumion · Enscape',3),('Media','公众号编辑 · 摄影 · 视频剪辑 · 活动策划',4),('Language','英语 CET-4 611 · CET-6 564 · 粤语',5) on conflict do nothing;
insert into skills(category,name,level,sort_order) values
('AI Tools','大语言模型辅助编程 · Prompt 设计 · API 调用','项目实践',6),
('Programming','Vibe Coding · Web 开发 · 自动化工作流','项目实践',7),
('Computer Vision','GroundingDINO · X-AnyLabeling · NightCity 语义分割','研究实践',8) on conflict do nothing;
