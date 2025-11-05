import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
}

export async function requireAuth(req: NextRequest): Promise<{ auth: AuthContext } | NextResponse> {
  const token = req.cookies.get("ms_token")?.value;
  const payload = verifyToken(token);
  
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return {
    auth: {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    },
  };
}

export async function requireRole(req: NextRequest, allowedRoles: string[]): Promise<{ auth: AuthContext } | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.auth.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return authResult;
}

export function validateRequest<T extends Record<string, any>>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: true; data: T } | { valid: false; error: string } {
  const missing = requiredFields.filter((field) => !body[field]);
  
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(", ")}` };
  }

  return { valid: true, data: body as T };
}

export function handleError(error: unknown, defaultMessage = "Internal server error") {
  console.error("API Error:", error);
  const message = error instanceof Error ? error.message : defaultMessage;
  return NextResponse.json({ error: message }, { status: 500 });
}
