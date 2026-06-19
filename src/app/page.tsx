import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function HomePage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    redirect(user ? "/dashboard" : "/login");
  }

  const cookieStore = await cookies();
  const devAuth = cookieStore.get("harvest-dev-auth")?.value === "1";
  redirect(devAuth ? "/dashboard" : "/login");
}
