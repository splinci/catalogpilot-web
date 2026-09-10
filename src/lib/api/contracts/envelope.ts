import { NextResponse } from "next/server";

export interface V1ApiResponse<T = any> {
  success: boolean;
  version: string;
  correlationId: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export function createV1Response<T>(
  data: T,
  requestId: string = "req_v1_default",
  pagination?: V1ApiResponse["pagination"],
  status = 200
): NextResponse {
  const payload: V1ApiResponse<T> = {
    success: true,
    version: "v1",
    correlationId: requestId,
    data,
    ...(pagination && { pagination }),
    timestamp: new Date().toISOString(),
  };

  const response = NextResponse.json(payload, { status });
  response.headers.set("X-API-Version", "v1");
  response.headers.set("X-Request-ID", requestId);
  return response;
}

export function createV1ErrorResponse(
  code: string,
  message: string,
  requestId: string = "req_v1_default",
  status = 400,
  details?: any
): NextResponse {
  const payload: V1ApiResponse = {
    success: false,
    version: "v1",
    correlationId: requestId,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  const response = NextResponse.json(payload, { status });
  response.headers.set("X-API-Version", "v1");
  response.headers.set("X-Request-ID", requestId);
  return response;
}
