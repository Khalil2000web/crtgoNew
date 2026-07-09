
import { notFound } from "next/navigation";

import PublicMenuClient from "./PublicMenuClient";
import { getBranchMenuPayload } from "../../_lib/publicMenuData";
import { getTemplateUnavailable } from "./_templates/templateRegistry";
import {
  getDefaultLanguage,
  getRequestedLanguage,
  normalizeEnabledLanguages,
  pickText,
} from "./_components/menuUtils";

export const revalidate = 500;

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
  const { businessSlug, branchSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) {
    return {
      title: "Menu not found | CRTGO",
    };
  }

  const language = resolveLanguage(data.menu, resolvedSearchParams);

  const businessName = pickText(
    data.business,
    "name",
    "name_i18n",
    language
  );

  const branchName = pickText(data.branch, "name", "name_i18n", language);

  const menuDescription =
    pickText(data.menu, "description_ar", "description_i18n", language) ||
    pickText(data.business, "description", "description_i18n", language);

  if (!data.billing?.isAvailable) {
    return {
      title: `${businessName || data.business.name} unavailable | CRTGO Menu`,
      description: "This menu is currently unavailable.",
    };
  }

  return {
    title: `${businessName || data.business.name} - ${
      branchName || data.branch.name
    } | CRTGO Menu`,
    description:
      menuDescription ||
      `View the menu for ${businessName || data.business.name}.`,
  };
}

export default async function BranchMenuHomePage({ params, searchParams }) {
  const { businessSlug, branchSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) notFound();

  if (!data.billing?.isAvailable) {
    return <TemplateUnavailablePage data={data} />;
  }

  const initialLanguage = resolveLanguage(data.menu, resolvedSearchParams);

  return (
    <PublicMenuClient
      business={data.business}
      branch={data.branch}
      menu={data.menu}
      sections={data.sections}
      branches={data.branches}
      initialLanguage={initialLanguage}
    />
  );
}