import { notFound } from "next/navigation";

import TemplateCleanCards from "../_templates/TemplateCleanCards";
import { getBranchMenuPayload } from "../../../_lib/publicMenuData";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { businessSlug, branchSlug, sectionSlug } = await params;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) {
    return {
      title: "Section not found | CRTGO",
    };
  }

  const section = data.sections.find(
    (item) => item.slug === sectionSlug
  );

  if (!section) {
    return {
      title: "Section not found | CRTGO",
    };
  }

  return {
    title: `${section.name_ar} - ${data.business.name} | CRTGO Menu`,
    description: `View ${section.name_ar} from ${data.business.name}.`,
  };
}

export default async function SectionMenuPage({ params }) {
  const { businessSlug, branchSlug, sectionSlug } = await params;
  const data = await getBranchMenuPayload(businessSlug, branchSlug);

  if (!data) notFound();

  const selectedSection = data.sections.find(
    (item) => item.slug === sectionSlug
  );

  if (!selectedSection) notFound();

  return (
    <TemplateCleanCards
      mode="section"
      selectedSection={selectedSection}
      business={data.business}
      branch={data.branch}
      menu={data.menu}
      sections={data.sections}
      branches={data.branches}
    />
  );
}