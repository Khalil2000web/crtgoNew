"use client";

import { useMemo, useState } from "react";

import ClassicTemplate from "./_templates/ClassicTemplate";
import ModernTemplate from "./_templates/ModernTemplate";
import LuxuryTemplate from "./_templates/LuxuryTemplate";
import {
  getDefaultLanguage,
  getTheme,
  normalizeEnabledLanguages,
} from "./_components/menuUtils";

export default function PublicMenuClient({ business, branch, menu, sections }) {
  const enabledLanguages = useMemo(
    () => normalizeEnabledLanguages(menu),
    [menu]
  );

  const defaultLanguage = useMemo(
    () => getDefaultLanguage(menu, enabledLanguages),
    [menu, enabledLanguages]
  );

  const [language, setLanguage] = useState(defaultLanguage);

  const theme = getTheme(menu);

  const templateProps = {
    business,
    branch,
    menu,
    sections,
    language,
    setLanguage,
    enabledLanguages,
    theme,
  };

  if (menu.template_id === "modern") {
    return <ModernTemplate {...templateProps} />;
  }

  if (menu.template_id === "luxury") {
    return <LuxuryTemplate {...templateProps} />;
  }

  return <ClassicTemplate {...templateProps} />;
}