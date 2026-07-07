import { Menu } from "lucide-react";

import MenuImage from "./MenuImage";
import { formatPrice, getTextDirection, pickText } from "./menuUtils";

export default function MenuItemCard({
  item,
  language,
  theme,
  variant = "classic",
}) {
  const dir = getTextDirection(language);
  const name = pickText(item, "name_ar", "name_i18n", language);
  const description = pickText(
    item,
    "description_ar",
    "description_i18n",
    language
  );

  if (variant === "luxury") {
    return (
      <article className="grid gap-4 rounded-[34px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl sm:grid-cols-[180px_1fr]">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px] bg-white/[0.05]">
          {item.image_url ? (
            <MenuImage src={item.image_url} alt={name} sizes="180px" />
          ) : (
            <Menu size={30} className="opacity-25" />
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h3
              className="text-3xl font-black tracking-[-0.06em]"
              dir={dir}
            >
              {name}
            </h3>

            <p
              className="shrink-0 rounded-full px-4 py-2 text-lg font-black"
              style={{
                backgroundColor: `${theme.primary}20`,
                color: theme.primary,
              }}
            >
              {formatPrice(item.price)}
            </p>
          </div>

          {description && (
            <p
              className="mt-3 text-sm font-bold leading-7 opacity-55"
              dir={dir}
            >
              {description}
            </p>
          )}
        </div>
      </article>
    );
  }

  if (variant === "modern") {
    return (
      <article className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.055] backdrop-blur-xl">
        <div className="relative flex aspect-[4/3] items-center justify-center bg-white/[0.04]">
          {item.image_url ? (
            <MenuImage
              src={item.image_url}
              alt={name}
              sizes="(max-width: 768px) 100vw, 420px"
            />
          ) : (
            <Menu size={34} className="opacity-25" />
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-2xl font-black tracking-[-0.05em]"
              dir={dir}
            >
              {name}
            </h3>

            <p
              className="shrink-0 rounded-2xl px-3 py-1 text-base font-black"
              style={{
                backgroundColor: `${theme.primary}20`,
                color: theme.primary,
              }}
            >
              {formatPrice(item.price)}
            </p>
          </div>

          {description && (
            <p
              className="mt-3 text-sm font-bold leading-7 opacity-55"
              dir={dir}
            >
              {description}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="grid gap-4 rounded-[28px] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl sm:grid-cols-[140px_1fr]">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[22px] bg-white/[0.05]">
        {item.image_url ? (
          <MenuImage src={item.image_url} alt={name} sizes="140px" />
        ) : (
          <Menu size={30} className="opacity-25" />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center p-1 sm:p-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h3
            className="text-2xl font-black tracking-[-0.04em]"
            dir={dir}
          >
            {name}
          </h3>

          <p
            className="shrink-0 rounded-2xl px-3 py-1 text-lg font-black"
            style={{
              backgroundColor: `${theme.primary}20`,
              color: theme.primary,
            }}
          >
            {formatPrice(item.price)}
          </p>
        </div>

        {description && (
          <p
            className="mt-2 text-sm font-bold leading-7 opacity-55"
            dir={dir}
          >
            {description}
          </p>
        )}
      </div>
    </article>
  );
}