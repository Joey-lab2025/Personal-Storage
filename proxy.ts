import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Authorization is verified in the admin client shell because the existing
// Supabase browser client persists its session in localStorage, not cookies.
export function proxy(request: NextRequest) { void request; return NextResponse.next(); }
export const config = { matcher: ["/admin/:path*"] };
