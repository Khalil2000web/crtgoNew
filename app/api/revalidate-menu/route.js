import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { menuId, subdomain, oldSubdomain } = body;

  if (!menuId) {
    return NextResponse.json({ error: "Missing menuId" }, { status: 400 });
  }

  const { data: menu } = await supabase
    .from("menus")
    .select("id, owner_id, subdomain")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (!menu) {
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }

  const currentSubdomain = subdomain || menu.subdomain;

  if (currentSubdomain) {
    revalidateTag(`public-menu:${currentSubdomain}`);
    revalidatePath(`/m/${currentSubdomain}`);
  }

  if (oldSubdomain && oldSubdomain !== currentSubdomain) {
    revalidateTag(`public-menu:${oldSubdomain}`);
    revalidatePath(`/m/${oldSubdomain}`);
  }

  return NextResponse.json({
    ok: true,
    revalidated: currentSubdomain,
  });
}