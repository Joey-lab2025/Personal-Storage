-- 来源：cv.pptx、cv-教职.pptx
-- 用途：补充可编辑描述，不改动已有事实字段；可重复执行。
begin;

update profile set
  summary = '风景园林背景的跨学科研究与设计实践者，研究兴趣涵盖 AI+景观、健康城市设计与风景园林理论。具备从数据采集、计算机视觉、社会网络分析到空间设计与内容传播的完整实践经验，能够将研究发现转化为设计策略、数字平台和公众传播内容。',
  updated_at = now()
where name_cn = '刘康';

update education set description = '硕士阶段聚焦 AI+景观、健康城市设计与风景园林理论，开展知识图谱、计算机视觉、社交媒体数据分析及城市感知研究。' where school like '华南农业大学%' and degree = '硕士';
update education set description = '接受系统的风景园林规划设计训练，形成景观设计、建模表达、植物设计与项目落地的专业基础。' where school like '华南农业大学%' and degree = '学士';

update experiences set
  description = '["负责《广东园林》微信公众号内容运营、文章编排与视觉设计，推动学术内容面向公众传播","参与学术会议通告与专题内容策划，参与 19+ 场学术沙龙直播，单场最高观看人数约 3000","运营期间公众号新增或覆盖 2000+ 粉丝，积累学术传播、直播执行与社交媒体运营经验"]'::jsonb,
  tags = '["新媒体运营","公众号排版","学术传播","直播策划","视觉设计"]'::jsonb
where company = '《广东园林》';

update experiences set
  description = '["负责有方空间 / Archiposition 微信公众号的日常运营、文章编排与内容质量维护","围绕建筑师、景观设计师及行业动态生产内容，参与“名师系列”专题","通过内容实践理解专业媒体、学术知识传播与平台用户互动之间的关系"]'::jsonb,
  tags = '["内容策划","新媒体编辑","建筑媒体","公众号运营"]'::jsonb
where company like '深圳市有方空间文化发展%';

update experiences set
  description = '["参与深圳美谷、云溪花园、越秀路、建设路道路提升及石井兵工厂等住宅与基础设施景观项目","协助完成场地规划、方案设计、建模渲染与汇报材料制作","根据项目技术要求为景观规划、设计表达和实施环节提供支持"]'::jsonb,
  tags = '["景观设计","场地规划","建模渲染","方案表达"]'::jsonb
where company like 'AECOM%';

update projects set
  description = '面向儿童、老年人、高压人群及商业空间等使用场景，构建可组合、可落地的健康花园产品体系。项目与广东丽芳园林合作完成。',
  highlights = '["调研经典疗愈花园案例并归纳设计准则与健康效益","完成 4 个健康花园系列、83 个模块和 4 类示例场景","为模块提供设计平面、模型、植物选择与健康效益说明，形成 101 页指导手册"]'::jsonb,
  skills = '["循证设计","用户与场景分析","植物设计","景观模块化","手册编制"]'::jsonb
where title_cn = '园林园艺健康景观设计指导手册';

update projects set
  description = '将健康花园手册中的设计方法转化为真实场地中的疗愈花园示例，完成从概念设计、施工配合到后期活动传播的落地闭环。',
  highlights = '["负责方案设计、施工配合、价目表整理与后期跟进","组织 30+ 人线下疗愈体验活动","完成推文、视频等传播内容，项目获《风景园林》报道，相关推文阅读量 1000+"]'::jsonb,
  skills = '["疗愈景观","方案设计","施工协调","活动策划","内容传播"]'::jsonb
where title_cn like '草云间%';

update projects set
  description = '以“交响曲”为叙事概念，将芳香植物的观赏、栽植、实训教学与休憩功能整合到实训工坊空间中。',
  highlights = '["组织芳香植物、操作台、讲台、作品展示、活动公告与休憩设施等功能","运用黄色混凝土、水洗石与竹木等材料建立统一空间语言","负责方案设计并推动项目建成"]'::jsonb,
  skills = '["空间设计","芳香植物","材料设计","教学场景设计"]'::jsonb
where title_cn like '芳香协奏曲%';

update projects set
  description = '针对华南农业大学兽医学院周边环境开展校园公共空间升级，统筹通行、停留、景观形象与使用需求。',
  highlights = '["负责现场问题梳理与整体方案设计","完成空间组织、景观节点及环境提升表达","部分方案进入建设实施"]'::jsonb,
  skills = '["校园更新","场地分析","景观设计","方案表达"]'::jsonb
where title_cn like '华南农业大学兽医学院%';

update projects set
  description = '将传统毕业展升级为“内容+体验+传播”的校园公共活动，以“戏”为主题组织户外展览、毕业市集与毕业分享。',
  highlights = '["统筹“戏·游、戏·集、戏·言”三类活动的策划与落地","线下参与 1000+ 人次，组织 30+ 个市集摊位","策划发布 23 篇系列推文，总浏览量 6000+"]'::jsonb,
  skills = '["活动策划","展览策划","项目统筹","视觉传播","公众号运营"]'::jsonb
where title_cn = '2024 年风景园林毕业展览';

update projects set
  description = '利用 Vibe Coding 工作流快速完成需求拆解、产品原型、功能实现与迭代，将专业内容和个人工作流程转化为可运行的数字产品。',
  highlights = '["设计并开发个人作品集网站，用于展示研究、设计与摄影内容","完成 2D 小游戏的原型与功能开发","完成微信公众号模板自动化排版工具，提升内容编辑效率"]'::jsonb,
  skills = '["Vibe Coding","AI 辅助开发","Next.js","TypeScript","Supabase","产品原型","工作流自动化"]'::jsonb
where title_cn = 'Vibe Coding 数字产品实践';

update research set
  description = '将知识图谱与社会网络分析引入西方现代风景园林理论史研究，揭示理论知识的生产、传播与演化过程。',
  methods = '以 186 万字文献为语料，通过 OCR、实体与关系抽取及大模型 Prompt 工程提取 1822 个实体；使用 Gephi 构建知识网络，并以中心性、模块化等指标识别关键要素。',
  dataset = '186 万字理论文献语料；1822 个实体及其关系数据',
  results = '独立完成数据收集、处理与网络分析，形成硕士论文；搭建在线交互式知识网络平台，实现要素展示与实时查询。'
where title like '社会网络分析视角下西方现代风景园林知识图谱%';

update research set
  description = '基于社交媒体图像和政策文本，定量研究改革开放以来中国大众景观审美的变迁特征及潜在驱动因素。',
  methods = '采集 1978—2023 年建成典型公园的网络图像，使用 X-AnyLabeling 与 GroundingDINO 辅助标注并训练 37 类景观要素检测模型；结合词频、主题与相关性分析研究政策和审美趋势。',
  dataset = '29,238 张网络图片；5,000 张典型训练图片；1,571 份政策文本；37 类景观要素',
  results = '形成景观审美变化的量化分析框架，并识别国家政策、经济发展等因素与审美偏好的潜在关联；研究成果拟投稿国际期刊。'
where title like '社交媒体数据与计算视觉技术在景观审美变迁%';

update research set
  description = '研究广州核心城区街道夜间环境与居民感知可跑性之间的关系，并将分析结果转化为夜跑友好型街道设计策略。',
  methods = '人工采集夜间街景，使用 NightCity 数据集进行语义分割，结合人机对抗评分评估安全感、恢复力、舒适度、吸引力和环境质量；通过空间自相关与 GWR 分析环境要素影响。',
  dataset = '19,943 张夜间街景；6 类感知指标；8 类街景环境指标',
  results = '识别不同类型夜跑环境及空间影响关系，形成《夜跑友好街道设计工具包》；作为核心成员完成 IFLA 亚太区获奖方案。'
where title like '基于大数据的城市夜间可跑性%';

insert into research(title,research_type,role,start_date,end_date,description,methods,dataset,results,sort_order,is_resume_default)
select '社交媒体中风景园林形象的错位与重构——以知乎、小红书为例','社交媒体研究','负责人','2022-12-01','2024-08-01','研究风景园林在知乎和小红书中的媒介形象，分析学科、行业与公众认知之间的错位及其形成机制。','采集平台图文内容，结合批评性话语分析与定量、定性研究，从直观印象、知识表征和社会实践三个层面建立媒介形象分析框架。','知乎与小红书公开图文内容','主导数据采集与分析，提出从体制建设、个体表达和传播机制协同重构媒介形象；以第一作者发表于《南方建筑》。',3,true
where not exists(select 1 from research where title like '社交媒体中风景园林形象的错位与重构%');

insert into research(title,research_type,role,start_date,end_date,description,methods,dataset,results,sort_order,is_resume_default)
select '国内风景园林学术研究合作网络特征分析','社会网络分析','负责人','2023-10-01','2024-02-01','分析国内风景园林学术合作网络的结构特征，理解合作关系对学科知识生产与研究活动发展的影响。','以 CNKI 风景园林主要期刊合著论文为数据源，独立完成数据清洗、网络构建，并使用 Gephi 分析点度中心性、中介中心性和模块化。','2011—2023 年主要期刊合著论文数据','以第一作者在《广东园林》发表论文 1 篇。',4,true
where not exists(select 1 from research where title = '国内风景园林学术研究合作网络特征分析');

insert into research(title,research_type,role,start_date,end_date,description,methods,dataset,results,sort_order,is_resume_default)
select '风景园林理论知识体系发展溯源','理论研究','主要研究者','2021-09-01','2023-12-01','梳理风景园林理论知识体系的形成与演变，为学科理论体系研究提供跨学科视角。','借鉴知识考古学方法，从人文与艺术、自然科学、社会科学三类基础学科梳理历史文献，归纳知识体系的演变特点与驱动因素。','相关学科历史文献与理论资料','以第二作者在中文核心期刊《风景园林》发表论文 1 篇。',5,true
where not exists(select 1 from research where title = '风景园林理论知识体系发展溯源');

update publications set doi = '10.3969/j.issn.1000-0232.2025.07.010', url = 'https://nfjz.arch.scut.edu.cn/CN/10.3969/j.issn.1000-0232.2025.07.010', status = '已发表' where title like '社交媒体中风景园林形象的错位与重构%';
update publications set doi = '10.3724/j.fjyl.202307150323', url = 'http://lalavision.com/cn/article/doi/10.3724/j.fjyl.202307150323', status = '已发表' where title = '风景园林理论知识体系发展溯源';
update publications set url = 'http://gdylzz.ijournals.cn/gdyl/article/abstract/202401001?st=article_issue', status = '已发表' where title = '国内风景园林学术研究合作网络特征分析';

update awards set description = '获奖作品：Toward Dynamic Optimization: Combining AI and EBHDL for the Elderly（迈向动态优化：结合人工智能和基于证据的老年人健康设计）。项目将人工智能与循证健康设计结合，探索面向老年人的动态优化景观策略。' where organization = 'ASLA';
update awards set description = '获奖作品：Weaving the Streets: A Vision for Promoting Night Running in Guangzhou（编织街道：广州夜跑未来愿景）。基于计算机视觉、感知评价与空间分析提出夜跑友好街道设计工具包。' where organization = 'IFLA';
update awards set description = '参加国际花园建造节，完成从方案设计到现场建造的团队协作实践，获得设计竞赛三等奖与建造二等奖。' where title like '国际花园建造节%';

update skills set level = '研究与项目实践' where category in ('Data','AI','Computer Vision');
update skills set level = '熟练' where category in ('Design','Modeling');
update skills set level = '项目实践' where category in ('Media','Programming','AI Tools');
update skills set level = 'CET-4 611；CET-6 564' where category = 'Language';

commit;
