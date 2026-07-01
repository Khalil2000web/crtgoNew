"use client";

import { useMemo, useState } from "react";
import { Menu } from "lucide-react";

import LanguageSwitcher from "../_components/LanguageSwitcher";
import MenuImage from "../_components/MenuImage";
import MenuItemCard from "../_components/MenuItemCard";
import SearchBox from "../_components/SearchBox";
import SectionNav from "../_components/SectionNav";
import SharedFooter from "../_components/SharedFooter";
import WorkingHoursPanel from "../_components/WorkingHoursPanel";
import {
  filterSections,
  getUi,
  isRtl,
  pickText,
} from "../_components/menuUtils";

export default function LuxuryTemplate({
  business,
  branch,
  menu,
  sections,
  language,
  setLanguage,
  enabledLanguages,
  theme,
}) {
  const [query, setQuery] = useState("");

  const businessName = pickText(business, "name", "name_i18n", language);
  const branchName = pickText(branch, "name", "name_i18n", language);
  const description = pickText(
    menu,
    "description_ar",
    "description_i18n",
    language
  );

  const logo = menu.logo_url || business.logo_url;
  const cover = menu.cover_url;

  const filteredSections = useMemo(
    () => filterSections(sections, query, language),
    [sections, query, language]
  );

  return (
    <main
      dir={isRtl(language) ? "rtl" : "ltr"}
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <header className="relative overflow-hidden px-4 py-5 sm:px-6">
        <div className="relative mx-auto min-h-[520px] max-w-7xl overflow-hidden rounded-[42px] border border-white/10 bg-white/[0.045]">
          {cover ? (
            <div className="absolute inset-0">
              <MenuImage
                src={cover}
                alt={businessName}
                priority
                sizes="100vw"
                className="opacity-65"
              />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at top, ${theme.primary}33, transparent 60%), #111`,
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/15" />

          <div className="relative flex min-h-[520px] flex-col items-center justify-center px-4 py-16 text-center">
            <div className="absolute right-5 top-5">
              <LanguageSwitcher
                enabledLanguages={enabledLanguages}
                language={language}
                setLanguage={setLanguage}
                theme={theme}
              />
            </div>

            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[36px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
              {logo ? (
                <MenuImage
                  src={logo}
                  alt={businessName}
                  priority
                  sizes="112px"
                />
              ) : (
                <Menu size={36} />
              )}
            </div>

            <p
              className="mt-8 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.22em]"
              style={{
                backgroundColor: `${theme.primary}22`,
                color: theme.primary,
              }}
            >
              {getUi(language, "digitalMenu")}
            </p>

            <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.08em] text-white sm:text-7xl">
              {businessName}
            </h1>

            <p className="mt-3 text-sm font-bold text-white/55">
              {branchName}
            </p>

            {description && (
              <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white/70">
                {description}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="sticky top-0 z-40 border-y border-white/10 bg-black/55 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1fr_2fr]">
          <SearchBox
            value={query}
            onChange={setQuery}
            language={language}
          />

          <SectionNav
            sections={sections}
            language={language}
            theme={theme}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <WorkingHoursPanel
            workingHours={branch.working_hours}
            language={language}
            theme={theme}
          />
        </aside>

        <div className="grid gap-12">
          {filteredSections.length ? (
            filteredSections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-32"
              >
                <div className="mb-5 flex items-center gap-4">
                  <div
                    className="h-px flex-1"
                    style={{
                      backgroundColor: `${theme.primary}55`,
                    }}
                  />

                  <h2 className="text-center text-4xl font-black tracking-[-0.07em]">
                    {pickText(section, "name_ar", "name_i18n", language)}
                  </h2>

                  <div
                    className="h-px flex-1"
                    style={{
                      backgroundColor: `${theme.primary}55`,
                    }}
                  />
                </div>

                <div className="grid gap-4">
                  {section.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      language={language}
                      theme={theme}
                      variant="luxury"
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <NoItems language={language} />
          )}
        </div>
      </section>

      <SharedFooter
        business={business}
        branch={branch}
        language={language}
        theme={theme}
      />
    </main>
  );
}

function NoItems({ language }) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-10 text-center">
      <h2 className="text-3xl font-black tracking-[-0.05em]">
        {getUi(language, "noItems")}
      </h2>

      <p className="mt-2 text-sm font-bold opacity-45">
        {getUi(language, "noItemsText")}
      </p>
    </div>
  );
}