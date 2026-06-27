import WSLandingClient from "./ws-landing-client";

export const metadata = {
  title: "CRTGO Web Services",
  description:
    "Premium web services, digital menus, websites, and business web systems by CRTGO.",
  openGraph: {
    title: "CRTGO Web Services",
    description:
      "Premium web services, digital menus, websites, and business web systems by CRTGO.",
    url: "https://ws.crtgo.com",
    siteName: "CRTGO Web Services",
    type: "website",
  },
};

export default function Page() {
  return <WSLandingClient />;
}