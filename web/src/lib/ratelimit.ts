import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,     // 100 requests per minute
};

export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  if (!entry || now >= entry.resetTime) {
    // Start new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export function rateLimitMiddleware(
  req: NextRequest,
  config?: RateLimitConfig
): NextResponse | null {
  const ip = getClientIP(req);
  const path = req.nextUrl.pathname;
  const key = `${ip}:${path}`;

  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: Math.ceil(result.resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
          'Retry-After': String(Math.ceil(result.resetIn / 1000)),
        },
      }
    );
  }

  return null; // Allow request to proceed
}

// Pre-configured rate limiters
export const strictRateLimit = { windowMs: 60 * 1000, maxRequests: 10 };
export const normalRateLimit = { windowMs: 60 * 1000, maxRequests: 60 };
export const looseRateLimit = { windowMs: 60 * 1000, maxRequests: 200 };
