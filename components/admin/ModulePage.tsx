import CrudEditor from "@/components/admin/CrudEditor";
import { modules } from "@/lib/resume-config";
import type { ResumeTable } from "@/types/resume";
export default function ModulePage({table}:{table:ResumeTable}) { return <CrudEditor config={modules[table]}/>; }
