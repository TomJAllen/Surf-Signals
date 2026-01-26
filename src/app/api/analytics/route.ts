import { NextResponse } from "next/server";

// Simple in-memory analytics for development
// In production, this would write to a database or analytics service
const analyticsBuffer: Array<{
  event: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
  userAgent?: string;
}> = [];

// Flush buffer periodically or when it gets too large
const MAX_BUFFER_SIZE = 100;

export async function POST(request: Request) {
  try {
    const { event, properties, timestamp } = await request.json();

    if (!event) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    // Add to buffer (in production, write to database/analytics service)
    analyticsBuffer.push({
      event,
      properties,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Keep buffer from growing too large
    if (analyticsBuffer.length > MAX_BUFFER_SIZE) {
      analyticsBuffer.shift();
    }

    // Log for development visibility
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${event}`, properties);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    // Always return success - analytics should never fail the user
    return NextResponse.json({ success: true });
  }
}

// GET endpoint for viewing analytics (admin only in production)
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  // Aggregate some basic stats
  const eventCounts: Record<string, number> = {};
  for (const entry of analyticsBuffer) {
    eventCounts[entry.event] = (eventCounts[entry.event] || 0) + 1;
  }

  return NextResponse.json({
    totalEvents: analyticsBuffer.length,
    eventCounts,
    recentEvents: analyticsBuffer.slice(-20),
  });
}
