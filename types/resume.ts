export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface Profile {
  id: string;
  name_cn: string;
  name_en: string;
  job_title: string;
  phone: string;
  email: string;
  city: string;
  website: string;
  github: string;
  linkedin: string;
  summary: string;
  avatar_url: string;
}

export interface ResumeRecord {
  id: string;
  sort_order: number;
  is_resume_default?: boolean;
  [key: string]: JsonValue | undefined;
}

export type ResumeTable = "education" | "experiences" | "projects" | "research" | "publications" | "skills" | "awards";

export interface ResumeData {
  profile: Profile | null;
  education: ResumeRecord[];
  experiences: ResumeRecord[];
  projects: ResumeRecord[];
  research: ResumeRecord[];
  publications: ResumeRecord[];
  skills: ResumeRecord[];
  awards: ResumeRecord[];
}
