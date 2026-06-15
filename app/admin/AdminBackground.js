"use client";

import { useEffect } from "react";

export default function AdminBackground() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const oldHtmlBg = html.style.backgroundColor;
    const oldBodyBg = body.style.backgroundColor;

    html.style.backgroundColor = "#0f0f0f";
    body.style.backgroundColor = "#0f0f0f";

    return () => {
      html.style.backgroundColor = oldHtmlBg;
      body.style.backgroundColor = oldBodyBg;
    };
  }, []);

  return null;
}