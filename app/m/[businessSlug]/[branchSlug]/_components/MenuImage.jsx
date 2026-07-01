import Image from "next/image";

export default function MenuImage({
  src,
  alt = "",
  priority = false,
  sizes = "100vw",
  className = "",
}) {
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`pointer-events-none select-none object-cover ${className}`}
    />
  );
}