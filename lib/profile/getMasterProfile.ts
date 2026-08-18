import { supabase } from "@/lib/supabase";
import type { MasterProfile } from "@/types/job";
import type { ResumeRecord } from "@/types/resume";
import type { SupabaseClient } from "@supabase/supabase-js";

const tables=["education","experiences","projects","research","publications","skills","awards"] as const;
export async function getMasterProfile(client:SupabaseClient=supabase):Promise<MasterProfile>{
 const [profileResult,...results]=await Promise.all([client.from("profile").select("*").limit(1).maybeSingle(),...tables.map(table=>client.from(table).select("*").order("sort_order"))]);
 if(profileResult.error)throw profileResult.error;
 const profile:MasterProfile={profile:profileResult.data,education:[],experiences:[],projects:[],research:[],publications:[],skills:[],awards:[]};
 tables.forEach((table,index)=>{const result=results[index];if(result.error)throw result.error;profile[table]=(result.data??[]) as ResumeRecord[]});
 return profile;
}
