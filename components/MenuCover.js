"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function MenuCover({ menu }) {
  const images = useMemo(() => {
    const coverImages = Array.isArray(menu?.cover_images)
      ? menu.cover_images
      : [];

    return [...coverImages, menu?.cover_url]
      .filter(Boolean)
      .filter((image, index, arr) => arr.indexOf(image) === index);
  }, [menu?.cover_images, menu?.cover_url]);

  const settings = menu?.cover_settings || {
    type: "single",
    speed: "normal",
  };

  const speedMap = {
    verySlow: 10000,
    slow: 7000,
    normal: 4000,
    fast: 2000,
  };

  const stackSpeedMap = {
    verySlow: 40000,
    slow: 30000,
    normal: 18000,
    fast: 10000,
  };

  const intervalSpeed = speedMap[settings.speed] || 4000;
  const stackSpeed = stackSpeedMap[settings.speed] || 18000;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images.length, settings.type]);

  useEffect(() => {
    if (images.length <= 1) return;
    if (settings.type === "single") return;
    if (settings.type === "stack") return;

    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalSpeed);

    return () => clearInterval(interval);
  }, [images.length, settings.type, intervalSpeed]);

  if (!images.length) return null;

  if (settings.type === "single") {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={images[0]}
          alt={menu?.name || "Menu cover"}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    );
  }

  if (settings.type === "carousel") {
    return (
      <div className="h-full w-full overflow-hidden" dir="ltr">
        <div
          className="flex h-full transition-transform duration-700"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {images.map((image, i) => (
            <div
              key={`${image}-${i}`}
              className="relative h-full min-w-full shrink-0"
            >
              <Image
                src={image}
                alt={menu?.name || "Menu cover"}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (settings.type === "stack") {
    const stackImages = [...images, ...images, ...images];

    return (
      <div className="h-full w-full overflow-hidden px-5 py-5" dir="ltr">
        <div
          className="flex h-full animate-cover-stack gap-3"
          style={{
            animationDuration: `${stackSpeed}ms`,
          }}
        >
          {stackImages.map((image, i) => (
            <div
              key={`${image}-${i}`}
              className="relative h-full min-w-[80%] overflow-hidden rounded-3xl"
            >
              <Image
                src={image}
                alt={menu?.name || "Menu cover"}
                fill
                sizes="80vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {images.map((image, i) => (
        <Image
          key={`${image}-${i}`}
          src={image}
          alt={menu?.name || "Menu cover"}
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}