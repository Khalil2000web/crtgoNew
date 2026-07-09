import { notFound, redirect } from "next/navigation";

import SectionCleanCardsClient from "../_templates/clean-cards/SectionCleanCardsClient";
import {
  getTemplateUnavailable,
  isCleanCardsTemplate,
} from "../_templates/templateRegistry";
import {
  getBranchHref,
  getBranchMenuPayload,
} from "../../../_lib/publicMenuData";
import {
  getDefaultLanguage,
  getRequestedLanguage,
  normalizeEnabledLanguages,
  pickText,
  withLanguageParam,
} from "../_components/menuUtils";

export const revalidate = 0;

function resolveLanguage(menu, searchParams) {
  const enabledLanguages = normalizeEnabledLanguages(menu);
  const defaultLanguage = getDefaultLanguage(menu, enabledLanguages);

  return getRequestedLanguage(searchParams, enabledLanguages) || defaultLanguage;
}

function getUnavailableMessage(status) {
  if (status === "past_due") {
    return "This menu is currently unavailable because billing needs attention.";
  }

  if (status === "paused") {
    return "This menu is currently paused.";
  }

  if (status === "canceled") {
    return "This menu is currently unavailable.";
  }

  return "This menu is currently unavailable.";
}

function TemplateUnavailablePage({ data }) {
  const Unavailable = getTemplateUnavailable(data?.menu?.template_id);

  return (
    <Unavailable
      title={data?.business?.name || "Menu unavailable"}
      message={getUnavailableMessage(data?.billing?.status)}
      logoUrl={data?.business?.logo_url || data?.menu?.logo_url || null}
    />
  );
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
    return <TemplateUnavailablePage data={data} />;
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