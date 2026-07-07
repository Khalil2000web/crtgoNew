import { LANGUAGE_META } from "./menuUtils";

export default function LanguageSwitcher({
  enabledLanguages,
  language,
  setLanguage,
  theme,
}) {
  if (!enabledLanguages || enabledLanguages.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {enabledLanguages.map((code) => {
        const active = code === language;
        const meta = LANGUAGE_META[code];

        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            className="min-h-9 rounded-full border px-3 text-xs font-black transition"
            title={meta?.label || code}
            style={{
              borderColor: active ? theme.primary : "rgba(255,255,255,.14)",
              backgroundColor: active ? theme.primary : "rgba(255,255,255,.07)",
              color: active ? "#000" : "#fff",
            }}
          >
            {meta?.short || code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}