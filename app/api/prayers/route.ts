import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const { altarSlug, title, body, candleCount, isPrivate } = payload;

  if (!body?.trim()) {
    return NextResponse.json({ error: "Prayer body is required." }, { status: 400 });
  }

  const { data: altar } = await supabase
    .from("altars")
    .select("id")
    .eq("slug", altarSlug)
    .eq("user_id", user.id)
    .single();

  if (!altar) {
    return NextResponse.json({ error: "Altar not found." }, { status: 404 });
  }

  const { error } = await supabase.from("prayers").insert({
    altar_id: altar.id,
    user_id: user.id,
    title: title?.trim() || "Untitled Petition",
    body: body.trim(),
    candle_count: Math.max(2, Math.min(12, Number(candleCount) || 6)),
    is_private: Boolean(isPrivate),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}