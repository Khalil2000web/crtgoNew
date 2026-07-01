import { pickText, scrollToSection } from "./menuUtils";

export default function SectionNav({ sections, language, theme }) {
  if (!sections?.length) return null;

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollToSection(section.id)}
          className="inline-flex min-h-10 shrink-0 items-center rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-sm font-black text-white/75 transition hover:text-white"
          style={{
            "--hover-color": theme.primary,
          }}
          dir="rtl"
        >
          {pickText(section, "name_ar", "name_i18n", language)}
        </button>
      ))}
    </nav>
  );
}