export default async function TenantPage({ params }) {
  const { host, path = [] } = await params;

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-3xl font-bold">
        WILDCARD WORKING ✅
      </h1>

      <pre className="mt-6 text-sm">
        {JSON.stringify(
          {
            host,
            path,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}