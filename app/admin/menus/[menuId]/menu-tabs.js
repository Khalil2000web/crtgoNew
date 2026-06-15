"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuTabs({ links }) {
  const pathname = usePathname();

  return (
    <div className="mt-6 w-full overflow-x-auto no-scrollbar">
      <div className="flex min-w-max items-center justify-center gap-2">
        {links.map((link, index) => {
          const active =
            index === 0
              ? pathname === link.href
              : pathname === link.href ||
                pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-md border px-5 py-3 text-sm font-bold transition ${
                active
                  ? "border-black bg-white text-black"
                  : "border-white text-white hover:border-white/30 hover:text-white"
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