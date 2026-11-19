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

    const { endpoint } = await request.json();

    // Remove subscription from database
    // In a real app, you'd delete from push_subscriptions table
    console.log("Unsubscribe from user:", user.id, endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unsubscribe from push:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
