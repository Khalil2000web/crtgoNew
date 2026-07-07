import { notFound } from "next/navigation";

import PublicMenuClient from "./PublicMenuClient";
import { getBranchMenuPayload } from "../../_lib/publicMenuData";
import PublicUnavailablePage from "../../_components/PublicUnavailablePage";
import {
  getDefaultLanguage,
  getRequestedLanguage,
  normalizeEnabledLanguages,
  pickText,
} from "./_components/menuUtils";

export const revalidate = 180;

function resolveLanguage(menu, searchParams) {
  const enabledLanguages = normalizeEnabledLanguages(menu);
  const defaultLanguage = getDefaultLanguage(menu, enabledLanguages);

  return getRequestedLanguage(searchParams, enabledLanguages) || defaultLanguage;
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
    return (
      <PublicUnavailablePage
        business={data.business}
        status={data.billing?.status}
      />
    );
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