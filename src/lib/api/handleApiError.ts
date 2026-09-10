import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/AppError";
import { logger } from "@/lib/observability/logger";

export function handleApiError(error: unknown, reqContext?: { route?: string; method?: string; requestId?: string; companyId?: string; userId?: string }) {
  if (error instanceof ZodError) {
    logger.warn("API request payload validation failed", {
      ...reqContext,
      statusCode: 422,
      errorCode: "VALIDATION_FAILED",
      errors: error.flatten(),
    });

    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        errors: error.flatten(),
      },
      {
        status: 422,
      }
    );
  }

  if (error instanceof AppError) {
    logger.warn(`API request application exception: ${error.message}`, {
      ...reqContext,
      statusCode: error.statusCode,
      errorCode: "APPLICATION_ERROR",
    });

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }

  // Server-side diagnostic log for unhandled internal exceptions
  logger.error("Unhandled internal server exception", {
    ...reqContext,
    statusCode: 500,
    errorCode: "INTERNAL_SERVER_ERROR",
    errorDetails: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Client response is ALWAYS 100% sanitized
  return NextResponse.json(
    {
      success: false,
      message: "Internal server error.",
    },
    {
      status: 500,
    }
  );
}