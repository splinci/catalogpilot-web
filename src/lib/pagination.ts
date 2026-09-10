import { NextRequest } from "next/server";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export function parsePaginationParams(req: NextRequest | URL): PaginationParams {
  const searchParams = req instanceof NextRequest ? req.nextUrl.searchParams : req.searchParams;

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const rawLimit = parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_LIMIT), 10);

  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = isNaN(rawLimit) || rawLimit < 1 ? DEFAULT_PAGE_LIMIT : Math.min(rawLimit, MAX_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginatedResult<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: totalPages || 1,
    },
  };
}
