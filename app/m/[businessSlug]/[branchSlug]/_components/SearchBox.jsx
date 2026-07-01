import { Search } from "lucide-react";

import { getUi } from "./menuUtils";

export default function SearchBox({ value, onChange, language }) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getUi(language, "searchPlaceholder")}
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-11 text-sm font-bold text-white outline-none placeholder:text-white/35 transition focus:border-white/25"
      />
    </div>
  );
}