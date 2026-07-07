import { notFound, redirect } from "next/navigation";

import SectionCleanCardsClient from "./SectionCleanCardsClient";
import {
  getBranchHref,
  getBranchMenuPayload,
} from "../../../_lib/publicMenuData";
import PublicUnavailablePage from "../../../_components/PublicUnavailablePage";
import {
  getDefaultLanguage,
  getRequestedLanguage,
  normalizeEnabledLanguages,
  pickText,
  withLanguageParam,
} from "../_components/menuUtils";

export const revalidate = 180;

function isCleanCardsTemplate(templateId) {
  const value = String(templateId || "").toLowerCase();

  return [
    "clean",
    "clean_cards",
    "clean-cards",
    "template_clean_cards",
  ].includes(value);
}

function resolveLanguage(menu, searchParams) {
  const enabledLanguages = normalizeEnabledLanguages(menu);
  const defaultLanguage = getDefaultLanguage(menu, enabledLanguages);

  return getRequestedLanguage(searchParams, enabledLanguages) || defaultLanguage;
}

export async function generateMetadata({ params, searchParams }) {
  const { businessSlug, branchSlug, sectionSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) {
    return {
      title: "Section not found | CRTGO",
    };
  }

  const language = resolveLanguage(data.menu, resolvedSearchParams);

  const businessName = pickText(
    data.business,
    "name",
    "name_i18n",
    language
  );

  if (!data.billing?.isAvailable) {
    return {
      title: `${businessName || data.business.name} unavailable | CRTGO Menu`,
      description: "This menu is currently unavailable.",
    };
  }

  const section = data.sections.find((item) => item.slug === sectionSlug);

  if (!section) {
    return {
      title: "Section not found | CRTGO",
    };
  }

  const sectionName = pickText(section, "name_ar", "name_i18n", language);

  return {
    title: `${sectionName || section.name_ar} - ${
      businessName || data.business.name
    } | CRTGO Menu`,
    description: `View ${sectionName || section.name_ar} from ${
      businessName || data.business.name
    }.`,
  };
}

export default async function SectionMenuPage({ params, searchParams }) {
  const { businessSlug, branchSlug, sectionSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) notFound();

  if (!data.billing?.isAvailable) {
    return (
      <PublicUnavailablePage
        business={data.business}
        status={data.billing?.status}
      />
    );
  }

  const selectedSection = data.sections.find(
    (item) => item.slug === sectionSlug
  );

  if (!selectedSection) notFound();

  const language = resolveLanguage(data.menu, resolvedSearchParams);

  if (!isCleanCardsTemplate(data.menu.template_id)) {
    const branchHref = withLanguageParam(
      getBranchHref(data.business.slug, data.branch.slug),
      language
    );

    redirect(`${branchHref}#section-${selectedSection.id}`);
  }

  return (
    <SectionCleanCardsClient
      initialLanguage={language}
      selectedSection={selectedSection}
      business={data.business}
      branch={data.branch}
      menu={data.menu}
      sections={data.sections}
      branches={data.branches}
    />
  );
}