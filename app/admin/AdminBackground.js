// components/AdminBackground.jsx
"use client";

import { useEffect } from "react";

export default function AdminBackground() {
  useEffect(() => {
    document.documentElement.classList.add("bg-[#0f0f0f]");
    document.body.classList.add("bg-[#0f0f0f]");

    return () => {
      document.documentElement.classList.remove("bg-[#0f0f0f]");
      document.body.classList.remove("bg-[#0f0f0f]");
    };
  }, []);

  return null;
}