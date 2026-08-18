import type { ResumeTable } from "@/types/resume";

export type FieldKind = "text" | "textarea" | "date" | "number" | "boolean" | "list";
export interface FieldConfig { key: string; label: string; kind?: FieldKind; required?: boolean }
export interface ModuleConfig { table: ResumeTable; title: string; fields: FieldConfig[] }

export const modules: Record<ResumeTable, ModuleConfig> = {
  education: { table: "education", title: "教育经历", fields: [
    {key:"school",label:"学校",required:true},{key:"degree",label:"学位"},{key:"major",label:"专业"},{key:"start_date",label:"开始日期",kind:"date"},{key:"end_date",label:"结束日期",kind:"date"},{key:"gpa",label:"GPA"},{key:"description",label:"补充说明",kind:"textarea"}
  ]},
  experiences: { table: "experiences", title: "工作 / 实习", fields: [
    {key:"company",label:"机构",required:true},{key:"department",label:"部门"},{key:"position",label:"职位"},{key:"location",label:"地点"},{key:"start_date",label:"开始日期",kind:"date"},{key:"end_date",label:"结束日期",kind:"date"},{key:"description",label:"经历描述（每行一条）",kind:"list"},{key:"tags",label:"标签（每行一个）",kind:"list"}
  ]},
  projects: { table: "projects", title: "项目经历", fields: [
    {key:"title_cn",label:"中文标题",required:true},{key:"title_en",label:"英文标题"},{key:"role",label:"角色"},{key:"project_type",label:"项目类型"},{key:"start_date",label:"开始日期",kind:"date"},{key:"end_date",label:"结束日期",kind:"date"},{key:"description",label:"简介",kind:"textarea"},{key:"highlights",label:"亮点（每行一条）",kind:"list"},{key:"skills",label:"技能（每行一个）",kind:"list"},{key:"url",label:"链接"}
  ]},
  research: { table: "research", title: "科研经历", fields: [
    {key:"title",label:"研究标题",required:true},{key:"research_type",label:"研究类型"},{key:"role",label:"角色"},{key:"start_date",label:"开始日期",kind:"date"},{key:"end_date",label:"结束日期",kind:"date"},{key:"description",label:"简介",kind:"textarea"},{key:"methods",label:"方法",kind:"textarea"},{key:"dataset",label:"数据集"},{key:"results",label:"成果",kind:"textarea"},{key:"url",label:"链接"}
  ]},
  publications: { table: "publications", title: "论文成果", fields: [
    {key:"title",label:"标题",required:true},{key:"journal",label:"期刊"},{key:"authors",label:"作者"},{key:"publication_date",label:"发表日期",kind:"date"},{key:"status",label:"状态"},{key:"doi",label:"DOI"},{key:"url",label:"链接"}
  ]},
  skills: { table: "skills", title: "技能", fields: [
    {key:"category",label:"类别",required:true},{key:"name",label:"技能",required:true},{key:"level",label:"熟练度"}
  ]},
  awards: { table: "awards", title: "获奖经历", fields: [
    {key:"title",label:"奖项",required:true},{key:"organization",label:"颁发机构"},{key:"award_date",label:"日期",kind:"date"},{key:"description",label:"说明",kind:"textarea"}
  ]}
};

export const adminLinks = ["profile", "education", "experience", "projects-resume", "research", "publications", "skills", "awards", "resume"];
