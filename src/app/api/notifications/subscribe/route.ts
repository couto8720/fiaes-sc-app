import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();

    // Store subscription in database
    // In a real app, you'd create a push_subscriptions table
    // For now, we'll just log it
    console.log("Push subscription from user:", user.id, subscription);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to subscribe to push:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
