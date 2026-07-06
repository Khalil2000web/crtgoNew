import { notFound } from "next/navigation";

import TemplateCleanCards from "./_templates/TemplateCleanCards";
import { getBranchMenuPayload } from "../../_lib/publicMenuData";
import PublicUnavailablePage from "../../_components/PublicUnavailablePage";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { businessSlug, branchSlug } = await params;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) {
    return {
      title: "Menu not found | CRTGO",
    };
  }

  if (!data.billing?.isAvailable) {
    return {
      title: `${data.business.name} unavailable | CRTGO Menu`,
      description: "This menu is currently unavailable.",
    };
  }

  return {
    title: `${data.business.name} - ${data.branch.name} | CRTGO Menu`,
    description:
      data.menu.description_ar ||
      data.business.description ||
      `View the menu for ${data.business.name}.`,
  };
}

export default async function BranchMenuHomePage({ params }) {
  const { businessSlug, branchSlug } = await params;
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

  return (
    <TemplateCleanCards
      mode="home"
      business={data.business}
      branch={data.branch}
      menu={data.menu}
      sections={data.sections}
      branches={data.branches}
    />
  );
}