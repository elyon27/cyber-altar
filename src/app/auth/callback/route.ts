import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const slug = searchParams.get("slug");
  const name = searchParams.get("name") || "Pilgrim Soul";
  const cookieStore = await cookies();

  if (!code || !slug) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login`);
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    display_name: name,
    altar_slug: slug,
  });

  await supabase.from("altars").upsert({
    user_id: user.id,
    slug,
    altar_name: name,
    theme: "lamb-light",
  });

  return NextResponse.redirect(`${origin}/altar/${slug}`);
}