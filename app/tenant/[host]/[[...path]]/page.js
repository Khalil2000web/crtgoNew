import { notFound } from "next/navigation";

import { resolveProject } from "@/lib/projects/resolveProject";

export default async function TenantPage({ params }) {
  const { host, path = [] } = await params;

  const project = await resolveProject(host);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <p className="text-sm text-white/50">
        CRTGO TENANT
      </p>

      <h1 className="mt-4 text-3xl font-bold">
        {project.slug}
      </h1>

      <pre className="mt-6 overflow-auto rounded-xl bg-white/10 p-4 text-sm">
        {JSON.stringify(
          {
            host,
            path,
            project,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}