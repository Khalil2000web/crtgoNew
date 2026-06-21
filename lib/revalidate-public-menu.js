export async function revalidatePublicMenu(menuId, subdomain, oldSubdomain) {
  if (!menuId) return;

  try {
    await fetch("/api/revalidate-menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuId,
        subdomain,
        oldSubdomain,
      }),
    });
  } catch {
    // Do nothing. We don't want to break admin saving if cache clearing fails.
  }
}