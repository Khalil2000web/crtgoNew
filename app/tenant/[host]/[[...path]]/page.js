import {
  notFound,
} from "next/navigation";

import {
  getPublicProject,
} from "@/services/menu/publicMenuData";

import StandardWebsite from "@/components/public-site/StandardWebsite";

export async function generateMetadata({
  params,
}) {
  const {
    host,
  } = await params;

  const project =
    await getPublicProject(host);

  if (!project) {
    return {
      title: "CRTRGO",
    };
  }

  return {
    title: project.name,
    description:
      project.description ||
      undefined,

    icons:
      project.faviconUrl
        ? {
            icon:
              project.faviconUrl,
          }
        : undefined,
  };
}

export default async function TenantPage({
  params,
}) {
  const {
    host,
    path,
  } = await params;

  if (
    Array.isArray(path) &&
    path.length > 0
  ) {
    notFound();
  }

  const project =
    await getPublicProject(host);

  if (!project) {
    notFound();
  }

  return (
    <StandardWebsite
      website={project}
    />
  );
}