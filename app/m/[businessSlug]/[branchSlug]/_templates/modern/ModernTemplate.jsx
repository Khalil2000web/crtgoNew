"use client";

import { useMemo, useState } from "react";
import { Menu } from "lucide-react";

import LanguageSwitcher from "@/app/m/[businessSlug]/[branchSlug]/_components/LanguageSwitcher";
import MenuImage from "@/app/m/[businessSlug]/[branchSlug]/_components/MenuImage";
import MenuItemCard from "@/app/m/[businessSlug]/[branchSlug]/_components/MenuItemCard";
import SearchBox from "@/app/m/[businessSlug]/[branchSlug]/_components/SearchBox";
import SectionNav from "@/app/m/[businessSlug]/[branchSlug]/_components/SectionNav";
import SharedFooter from "@/app/m/[businessSlug]/[branchSlug]/_components/SharedFooter";
import WorkingHoursPanel from "@/app/m/[businessSlug]/[branchSlug]/_components/WorkingHoursPanel";
import {
  filterSections,
  getUi,
  isRtl,
  pickText,
} from "../../_components/menuUtils";

export default function ModernTemplate({
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
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[360px_1fr]">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
          <div className="flex h-full flex-col overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.055] backdrop-blur-xl">
            <div className="relative h-56 bg-white/[0.05]">
              {cover ? (
                <MenuImage
                  src={cover}
                  alt={businessName}
                  priority
                  sizes="360px"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: `radial-gradient(circle at top, ${theme.primary}44, transparent 60%), #111`,
                  }}
                />
              )}

              <div className="absolute inset-0 bg-black/25" />

              <div className="absolute right-4 top-4">
                <LanguageSwitcher
                  enabledLanguages={enabledLanguages}
                  language={language}
                  setLanguage={setLanguage}
                  theme={theme}
                />
              </div>
            </div>

            <div className="p-5">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[26px] border border-white/10 bg-white/10">
                {logo ? (
                  <MenuImage
                    src={logo}
                    alt={businessName}
                    priority
                    sizes="80px"
                  />
                ) : (
                  <Menu size={30} />
                )}
              </div>

              <p
                className="mt-5 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: `${theme.primary}22`,
                  color: theme.primary,
                }}
              >
                {getUi(language, "digitalMenu")}
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.07em]">
                {businessName}
              </h1>

              <p className="mt-2 text-sm font-bold opacity-45">
                {branchName}
              </p>

              {description && (
                <p className="mt-4 text-sm font-bold leading-7 opacity-60">
                  {description}
                </p>
              )}
            </div>

            <div className="mt-auto p-5 pt-0">
              <WorkingHoursPanel
                workingHours={branch.working_hours}
                language={language}
                theme={theme}
              />
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="sticky top-0 z-40 border-b border-white/10 bg-black/55 py-3 backdrop-blur-2xl">
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

          <div className="grid gap-9 py-6">
            {filteredSections.length ? (
              filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={`section-${section.id}`}
                  className="scroll-mt-32"
                >
                  <h2 className="text-4xl font-black tracking-[-0.07em]">
                    {pickText(section, "name_ar", "name_i18n", language)}
                  </h2>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {section.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        language={language}
                        theme={theme}
                        variant="modern"
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