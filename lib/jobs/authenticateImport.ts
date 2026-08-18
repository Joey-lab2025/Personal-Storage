import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export async function authenticatedJobClient(request: Request): Promise<SupabaseClient> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("UNAUTHORIZED");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (process.env.JOB_IMPORT_TOKEN && token === process.env.JOB_IMPORT_TOKEN) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error("SERVER_IMPORT_NOT_CONFIGURED");
    return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  const verifier = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await verifier.auth.getUser(token);
  if (error || !data.user) throw new Error("UNAUTHORIZED");
  return createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
}
