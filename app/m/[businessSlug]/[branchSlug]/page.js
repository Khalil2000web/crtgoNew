import { notFound } from "next/navigation";

import TemplateCleanCards from "./_templates/TemplateCleanCards";
import { getBranchMenuPayload } from "../../_lib/publicMenuData";

export const revalidate = 180;

export async function generateMetadata({ params }) {
  const { businessSlug, branchSlug } = await params;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) {
    return {
      title: "Menu not found | CRTGO",
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