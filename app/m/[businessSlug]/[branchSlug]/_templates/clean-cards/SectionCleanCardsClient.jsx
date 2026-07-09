"use client";

import { useEffect, useMemo, useState } from "react";

import TemplateCleanCards from "./TemplateCleanCards";
import {
  getDefaultLanguage,
  getTheme,
  normalizeEnabledLanguages,
  normalizeLanguageCode,
} from "../../_components/menuUtils";

function getUrlLanguage() {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const value = params.get("lang") || params.get("language");

  return value ? normalizeLanguageCode(value) : null;
}

function updateUrlLanguage(language) {
  if (typeof window === "undefined") return;

  const cleanLanguage = normalizeLanguageCode(language);
  const url = new URL(window.location.href);

  url.searchParams.delete("language");

  if (cleanLanguage === "ar") {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", cleanLanguage);
  }

  window.history.replaceState({}, "", url.toString());
}

export default function SectionCleanCardsClient({
  initialLanguage = "ar",
  selectedSection,
  business,
  branch,
  menu,
  sections,
  branches = [],
}) {
  const enabledLanguages = useMemo(
    () => normalizeEnabledLanguages(menu),
    [menu]
  );

  const defaultLanguage = useMemo(
    () => getDefaultLanguage(menu, enabledLanguages),
    [menu, enabledLanguages]
  );

  const initialSafeLanguage = enabledLanguages.includes(
    normalizeLanguageCode(initialLanguage)
  )
    ? normalizeLanguageCode(initialLanguage)
    : defaultLanguage;

  const [language, setLanguageState] = useState(initialSafeLanguage);

  useEffect(() => {
    const urlLanguage = getUrlLanguage();
    const savedLanguage = localStorage.getItem(`crtgo-language-${menu.id}`);

    if (urlLanguage && enabledLanguages.includes(urlLanguage)) {
      setLanguageState(urlLanguage);
      localStorage.setItem(`crtgo-language-${menu.id}`, urlLanguage);
      return;
    }

    if (savedLanguage && enabledLanguages.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      updateUrlLanguage(savedLanguage);
      return;
    }

    setLanguageState(defaultLanguage);
    updateUrlLanguage(defaultLanguage);
  }, [menu.id, enabledLanguages, defaultLanguage]);

  function setLanguage(nextLanguage) {
    const cleanLanguage = normalizeLanguageCode(nextLanguage);

    if (!enabledLanguages.includes(cleanLanguage)) return;

    setLanguageState(cleanLanguage);
    localStorage.setItem(`crtgo-language-${menu.id}`, cleanLanguage);
    updateUrlLanguage(cleanLanguage);
  }

  return (
    <TemplateCleanCards
      mode="section"
      selectedSection={selectedSection}
      business={business}
      branch={branch}
      menu={menu}
      sections={sections}
      branches={branches}
      language={language}
      setLanguage={setLanguage}
      enabledLanguages={enabledLanguages}
      theme={getTheme(menu)}
    />
  );
}