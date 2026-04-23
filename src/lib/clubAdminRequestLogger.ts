import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ROLE } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';

const CLUB_ADMIN_SCOPE_HEADER = 'x-admin-scope';
const CLUB_ADMIN_SCOPE_VALUE = 'club-admin';
const PAYLOAD_LIMIT = 5000;

const trimToLimit = (value: string) =>
  value.length > PAYLOAD_LIMIT ? `${value.slice(0, PAYLOAD_LIMIT)}...` : value;

const safeStringify = (value: unknown) => {
  try {
    return trimToLimit(JSON.stringify(value));
  } catch {
    return trimToLimit(String(value));
  }
};

const toRole = (value: unknown): ROLE | undefined => {
  if (value === ROLE.ADMIN || value === ROLE.USER) {
    return value;
  }

  return undefined;
};

const readPayload = async (req: NextRequest) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  const contentType = req.headers.get('content-type') ?? '';
  const requestClone = req.clone();

  if (contentType.includes('application/json')) {
    const text = await requestClone.text();
    if (!text) {
      return undefined;
    }

    try {
      return safeStringify(JSON.parse(text));
    } catch {
      return trimToLimit(text);
    }
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await requestClone.formData();
    return safeStringify({
      contentType: 'multipart/form-data',
      fields: Array.from(formData.keys()),
    });
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await requestClone.text();
    return trimToLimit(text);
  }

  const text = await requestClone.text();
  return text ? trimToLimit(text) : undefined;
};

const shouldLogRequest = (req: NextRequest) =>
  req.headers.get(CLUB_ADMIN_SCOPE_HEADER) === CLUB_ADMIN_SCOPE_VALUE;

const createLogSafely = async (data: {
  method: string;
  path: string;
  query?: string;
  payload?: string;
  adminUserId?: string;
  adminUsername?: string;
  adminRole?: ROLE;
  clubAdminId?: number;
  statusCode?: number;
  error?: string;
}) => {
  try {
    await prisma.clubAdminRequestLog.create({
      data: {
        method: data.method,
        path: data.path,
        query: data.query,
        payload: data.payload,
        adminUserId: data.adminUserId,
        adminUsername: data.adminUsername,
        adminRole: data.adminRole,
        clubAdminId: data.clubAdminId,
        statusCode: data.statusCode,
        error: data.error,
      },
    });
  } catch (error) {
    console.error('Failed to create club admin request log:', error);
  }
};

export async function withClubAdminRequestLog(
  req: NextRequest,
  handler: () => Promise<NextResponse>
) {
  if (!shouldLogRequest(req)) {
    return handler();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const queryObject = Object.fromEntries(req.nextUrl.searchParams.entries());
  const payload = await readPayload(req);

  const baseLog = {
    method: req.method,
    path: req.nextUrl.pathname,
    query: Object.keys(queryObject).length ? safeStringify(queryObject) : undefined,
    payload,
    adminUserId: (token?.id as string | undefined) ?? (token?.sub as string | undefined),
    adminUsername: token?.username as string | undefined,
    adminRole: toRole(token?.role),
    clubAdminId:
      typeof token?.clubAdminId === 'number'
        ? token.clubAdminId
        : Number.isFinite(Number(token?.clubAdminId))
          ? Number(token?.clubAdminId)
          : undefined,
  };

  try {
    const response = await handler();
    await createLogSafely({
      ...baseLog,
      statusCode: response.status,
    });

    return response;
  } catch (error) {
    await createLogSafely({
      ...baseLog,
      statusCode: 500,
      error: safeStringify(error),
    });

    throw error;
  }
}
