import { notFound } from "next/navigation";

import { resolveProject } from "@/lib/projects/resolveProject";
import { getProjectMenuPayload } from "@/lib/projects/getProjectMenuPayload";

export default async function TenantPage({
  params,
}) {
  const {
    host,
    path = [],
  } = await params;

  const project =
    await resolveProject(host);

  if (!project) {
    notFound();
  }

  if (
    project.service_type !== "menu"
  ) {
    notFound();
  }

  const data =
    await getProjectMenuPayload(
      project,
    );

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm font-medium text-white/50">
        REAL MENU DATA ✅
      </p>

      <h1 className="mt-4 text-3xl font-bold">
        {data.business?.name ||
          "Restaurant"}
      </h1>

      <div className="mt-6 space-y-2 text-sm">
        <p>
          <strong>Project:</strong>{" "}
          {project.slug}
        </p>

        <p>
          <strong>Hostname:</strong>{" "}
          {host}
        </p>

        <p>
          <strong>Branch:</strong>{" "}
          {data.branch?.name ||
            "Unknown"}
        </p>

        <p>
          <strong>Template:</strong>{" "}
          {data.menu?.template_id ||
            "Unknown"}
        </p>

        <p>
          <strong>Sections:</strong>{" "}
          {data.sections?.length ?? 0}
        </p>

        <p>
          <strong>Path:</strong>{" "}
          /
          {path.join("/")}
        </p>
      </div>
    </main>
  );
}