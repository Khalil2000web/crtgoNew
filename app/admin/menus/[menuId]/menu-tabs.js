"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuTabs({ links }) {
  const pathname = usePathname();

  return (
    <div className="mt-6 w-full overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-center min-w-max gap-2">
        {links.map((link) => {
          const active =
            link.href === pathname ||
            pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-md border px-5 py-3 text-sm transition ${
                active
                  ? "border-black bg-white text-black font-bold"
                  : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}