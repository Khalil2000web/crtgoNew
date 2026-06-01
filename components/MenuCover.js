"use client";

import { useEffect, useState } from "react";

export default function MenuCover({ menu }) {
  const images =
    menu.cover_images?.length > 0
      ? menu.cover_images
      : menu.cover_url
        ? [menu.cover_url]
        : [];

  const settings = menu.cover_settings || {
    type: "single",
    speed: "normal",
  };

  const fadeSpeedMap = {
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

  const intervalSpeed = fadeSpeedMap[settings.speed] || 4000;
  const stackSpeed = stackSpeedMap[settings.speed] || 18000;

  const [index, setIndex] = useState(0);

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
        <img
          src={images[0]}
          alt={menu.name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (settings.type === "carousel") {
    return (
      <div className="h-full w-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700"
          style={{
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {images.map((image) => (
            <img
              key={image}
              src={image}
              alt={menu.name}
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>
      </div>
    );
  }

  if (settings.type === "stack") {
    return (
      <div className="h-full w-full overflow-hidden px-5 py-5">
        <div
          className="flex h-full animate-cover-stack gap-3"
          style={{
            animationDuration: `${stackSpeed}ms`,
          }}
        >
          {[...images, ...images].map((image, i) => (
            <img
              key={`${image}-${i}`}
              src={image}
              alt={menu.name}
              className="h-full min-w-[80%] rounded-3xl object-cover"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {images.map((image, i) => (
        <img
          key={image}
          src={image}
          alt={menu.name}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}