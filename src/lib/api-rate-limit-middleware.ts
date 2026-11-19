import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./rate-limit";

export async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  endpoint?: string
): Promise<NextResponse> {
  const identifier = getClientIdentifier(request);

  const { allowed, remaining, resetAt } = await checkRateLimit(identifier, endpoint);

  const response = allowed
    ? await handler(request)
    : new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          remaining: 0,
          resetAt: resetAt.toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetAt.toISOString(),
          },
        }
      );

  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", resetAt.toISOString());

  return response;
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || request.ip || "anonymous";
  const path = request.nextUrl.pathname;
  return `${path}:${ip}`;
}
