import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BranchesForm from "./branches-form";

export default async function BranchesPage({ params }) {
  const { menuId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/start");

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", menuId)
    .eq("owner_id", user.id)
    .single();

  if (!menu) notFound();

  const { data: branches } = await supabase
    .from("branches")
    .select("*")
    .eq("menu_id", menu.id)
    .order("sort_order", { ascending: true });

  return (
    <main dir="rtl" className="min-h-screen bg-black px-5 py-8 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href={`/admin/menus/${menu.id}`} className="text-sm text-white/50">
          ← الرجوع لإدارة القائمة
        </Link>

        <h1 className="mt-8 text-4xl font-black">الفروع</h1>

        <BranchesForm menuId={menu.id} branches={branches || []} />
      </section>
    </main>
  );
}