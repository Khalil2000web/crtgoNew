export const LANGUAGES = [
  {
    code: "ar",
    label: "العربية",
    shortLabel: "عربي",
    dir: "rtl",
  },
  {
    code: "he",
    label: "עברית",
    shortLabel: "עברית",
    dir: "rtl",
  },
  {
    code: "en",
    label: "English",
    shortLabel: "EN",
    dir: "ltr",
  },
];

export function getLanguage(code) {
  return LANGUAGES.find((language) => language.code === code) || LANGUAGES[0];
}

export function isRtlLanguage(code) {
  return getLanguage(code).dir === "rtl";
}

export function normalizeEnabledLanguages(value) {
  if (!Array.isArray(value)) return ["ar"];

  const allowed = LANGUAGES.map((language) => language.code);

  const cleaned = value.filter((code) => allowed.includes(code));

  return cleaned.length ? cleaned : ["ar"];
}

export function getTranslatedText(translations, language, fallbackText = "") {
  if (!translations || typeof translations !== "object") {
    return fallbackText || "";
  }

  return (
    translations[language] ||
    translations.ar ||
    fallbackText ||
    ""
  );
}

export function setTranslatedText(translations, language, value) {
  return {
    ...(translations || {}),
    [language]: value,
  };
}