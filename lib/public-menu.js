import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export async function getPublicMenu(handle) {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();

      const { data: menu } = await supabase
        .from("menus")
        .select(`
          *,
          sections (
            *,
            items (*)
          )
        `)
        .eq("subdomain", handle)
        .eq("status", "active")
        .single();

      return menu;
    },
    ["public-menu", handle],
    {
      revalidate: 600,
      tags: [`public-menu:${handle}`],
    }
  )();
}