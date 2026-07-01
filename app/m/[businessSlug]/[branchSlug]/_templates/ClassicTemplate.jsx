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

export default function ClassicTemplate({
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
      <header className="relative overflow-hidden">
        {cover ? (
          <div className="absolute inset-0">
            <MenuImage
              src={cover}
              alt={businessName}
              priority
              sizes="100vw"
              className="opacity-80"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at top, ${theme.primary}33, transparent 55%), #111`,
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/55" />

        <section className="relative mx-auto flex min-h-[360px] w-full max-w-5xl flex-col justify-end px-4 pb-8 pt-20 sm:px-6">
          <div className="absolute right-4 top-4 sm:right-6">
            <LanguageSwitcher
              enabledLanguages={enabledLanguages}
              language={language}
              setLanguage={setLanguage}
              theme={theme}
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[32px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
              {logo ? (
                <MenuImage
                  src={logo}
                  alt={businessName}
                  priority
                  sizes="96px"
                />
              ) : (
                <Menu size={34} />
              )}
            </div>

            <div className="min-w-0">
              <p
                className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: `${theme.primary}22`,
                  color: theme.primary,
                }}
              >
                {getUi(language, "digitalMenu")}
              </p>

              <h1 className="text-4xl font-black tracking-[-0.07em] text-white sm:text-6xl">
                {businessName}
              </h1>

              <p className="mt-2 text-sm font-bold text-white/65">
                {branchName}
              </p>
            </div>
          </div>

          {description && (
            <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white/75">
              {description}
            </p>
          )}
        </section>
      </header>

      <section className="sticky top-0 z-40 border-b border-white/10 bg-black/55 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <SearchBox
            value={query}
            onChange={setQuery}
            language={language}
          />

          <div className="mt-3">
            <SectionNav
              sections={sections}
              language={language}
              theme={theme}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6">
        <WorkingHoursPanel
          workingHours={branch.working_hours}
          language={language}
          theme={theme}
        />

        {filteredSections.length ? (
          <div className="grid gap-8">
            {filteredSections.map((section) => (
              <section
                key={section.id}
                id={`section-${section.id}`}
                className="scroll-mt-32"
              >
                <h2 className="text-3xl font-black tracking-[-0.05em]">
                  {pickText(section, "name_ar", "name_i18n", language)}
                </h2>

                <div className="mt-4 grid gap-3">
                  {section.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      language={language}
                      theme={theme}
                      variant="classic"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <NoItems language={language} />
        )}
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