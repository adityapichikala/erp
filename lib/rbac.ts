import { Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, SessionUser } from './auth'

// ─── Types ────────────────────────────────────────────────────────────────────

type RouteHandler = (
  req: NextRequest,
  context: { params: any },
  user: SessionUser
) => Promise<NextResponse> | NextResponse

// ─── requireRole ─────────────────────────────────────────────────────────────

/**
 * Wraps a Route Handler to enforce role-based access control.
 *
 * Usage:
 *   export const GET = requireRole(['TEACHER', 'HOD'], async (req, ctx, user) => {
 *     // user is guaranteed to be authenticated + have an allowed role
 *   })
 *
 * Returns:
 *   401 — no valid session cookie
 *   403 — authenticated but wrong role
 */
export function requireRole(allowedRoles: Role[], handler: RouteHandler) {
  return async (
    req: NextRequest,
    context: { params: any }
  ): Promise<NextResponse> => {
    const user = getSessionUser(req)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return handler(req, context, user)
  }
}

// ─── requireScope ─────────────────────────────────────────────────────────────

/**
 * Stub for per-record scope checks.
 *
 * Each module plugs in its own check here, for example:
 *
 *   TEACHER — can only touch courses they teach:
 *     TODO: query Course where id = params.courseId AND teacherId = user.userId
 *
 *   STUDENT — can only see their own submissions:
 *     TODO: query Submission where id = params.submissionId AND studentId = user.userId
 *
 *   HOD — scoped to their own department:
 *     TODO: verify resource.departmentId === user.departmentId
 *
 * Return true if the user is allowed to access the resource, false otherwise.
 * Call this inside the handler after requireRole has confirmed the role.
 */
export async function requireScope(
  _user: SessionUser,
  _resourceId: string,
  _resourceType: string
): Promise<boolean> {
  // TODO: implement per-module scope checks
  // Each module that calls this function should override the logic with:
  //   - TEACHER: check course.teacherId === user.userId
  //   - STUDENT: check submission.studentId === user.userId
  //   - HOD: check resource.departmentId === user.departmentId
  // For now, return true (open) — modules tighten this in their own handlers.
  return true
}
