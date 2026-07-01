import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { Phone } from "lucide-react";

import {
  buildSocialLinks,
  getUi,
  pickText,
} from "./menuUtils";

export default function SharedFooter({
  business,
  branch,
  language,
  theme,
}) {
  const links = buildSocialLinks(branch, language);
  const businessName = pickText(business, "name", "name_i18n", language);

  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
        <h2 className="text-xl font-black">{businessName}</h2>

        {branch.address && (
          <p className="mt-2 text-sm font-bold opacity-45">
            {branch.address}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {links.map((link) => (
            <FooterLink
              key={link.key}
              href={link.href}
              icon={getSocialIcon(link.key)}
              theme={theme}
            >
              {link.label}
            </FooterLink>
          ))}
        </div>

        <p className="mt-6 border-t border-white/10 pt-4 text-xs font-black uppercase tracking-[0.18em] opacity-35">
          {getUi(language, "poweredBy")}
        </p>
      </div>
    </footer>
  );
}

function getSocialIcon(key) {
  if (key === "phone") return <Phone size={16} />;
  if (key === "whatsapp") return <FaWhatsapp size={16} />;
  if (key === "instagram") return <FaInstagram size={16} />;
  if (key === "facebook") return <FaFacebookF size={15} />;
  if (key === "tiktok") return <FaTiktok size={15} />;

  return null;
}

function FooterLink({ href, icon, children }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black opacity-75 transition hover:bg-white/[0.1] hover:opacity-100"
    >
      {icon}
      {children}
    </a>
  );
}