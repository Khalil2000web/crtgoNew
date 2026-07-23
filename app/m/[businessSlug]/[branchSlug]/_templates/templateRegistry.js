import ClassicTemplate from "./classic/ClassicTemplate";
import ClassicLoading from "./classic/ClassicLoading";
import ClassicUnavailable from "./classic/ClassicUnavailable";

import ModernTemplate from "./modern/ModernTemplate";
import ModernLoading from "./modern/ModernLoading";
import ModernUnavailable from "./modern/ModernUnavailable";

import LuxuryTemplate from "./luxury/LuxuryTemplate";
import LuxuryLoading from "./luxury/LuxuryLoading";
import LuxuryUnavailable from "./luxury/LuxuryUnavailable";

import TemplateCleanCards from "./clean-cards/TemplateCleanCards";
import CleanCardsLoading from "./clean-cards/CleanCardsLoading";
import CleanCardsUnavailable from "./clean-cards/CleanCardsUnavailable";

import CafeTemplate from "./cafe/CafeTemplate";

export const TEMPLATE_REGISTRY = {
  classic: {
    id: "classic",
    name: "Classic",
    badge: "Default",
    description:
      "A full scrolling menu with a strong restaurant landing area.",
    preview: "classic",
    businessTypes: ["restaurant", "cafe", "bakery", "other"],
    aliases: [],

    Template: ClassicTemplate,
    Loading: ClassicLoading,
    Unavailable: ClassicUnavailable,
  },

  cafe_cozy: {
    id: "cafe_cozy",
    name: "Cozy Café",
    badge: "Café",
    description:
      "A warm and minimal menu designed for cafés, bakeries, and dessert shops.",
    preview: "cafe",
    businessTypes: ["cafe", "bakery", "dessert"],
    aliases: [
      "cafe",
      "café",
      "cafe-cozy",
      "cozy-cafe",
      "cozy_cafe",
    ],

    Template: CafeTemplate,

    // Automatic fallback until café-specific states are created.
    Loading: ClassicLoading,
    Unavailable: ClassicUnavailable,
  },

  modern: {
    id: "modern",
    name: "Modern",
    badge: "Wide",
    description:
      "A modern split layout with the brand panel beside the menu.",
    preview: "modern",
    businessTypes: ["restaurant", "cafe", "bar", "other"],
    aliases: [],

    Template: ModernTemplate,
    Loading: ModernLoading,
    Unavailable: ModernUnavailable,
  },

  luxury: {
    id: "luxury",
    name: "Luxury",
    badge: "Premium",
    description:
      "Large hero, premium spacing, and stronger visual branding.",
    preview: "luxury",
    businessTypes: ["restaurant", "hotel", "lounge", "bar"],
    aliases: [],

    Template: LuxuryTemplate,
    Loading: LuxuryLoading,
    Unavailable: LuxuryUnavailable,
  },

  clean_cards: {
    id: "clean_cards",
    name: "Clean Cards",
    badge: "Section Pages",
    description:
      "Section cards first, then each section opens as its own page.",
    preview: "cards",
    businessTypes: ["restaurant", "cafe", "bakery", "other"],
    aliases: [
      "clean",
      "clean-cards",
      "template_clean_cards",
    ],
    requirements: ["section_pages"],

    Template: TemplateCleanCards,
    Loading: CleanCardsLoading,
    Unavailable: CleanCardsUnavailable,
  },
};

export function normalizeTemplateId(templateId) {
  const value = String(templateId || "classic")
    .trim()
    .toLowerCase();

  const directMatch = TEMPLATE_REGISTRY[value];

  if (directMatch) {
    return directMatch.id;
  }

  const aliasMatch = Object.values(TEMPLATE_REGISTRY).find((template) =>
    template.aliases?.includes(value)
  );

  return aliasMatch?.id || "classic";
}

export function getTemplateBundle(templateId) {
  const cleanId = normalizeTemplateId(templateId);

  return TEMPLATE_REGISTRY[cleanId] || TEMPLATE_REGISTRY.classic;
}

export function getTemplateComponent(templateId) {
  return getTemplateBundle(templateId).Template;
}

export function getTemplateLoading(templateId) {
  return (
    getTemplateBundle(templateId).Loading ||
    TEMPLATE_REGISTRY.classic.Loading
  );
}

export function getTemplateUnavailable(templateId) {
  return (
    getTemplateBundle(templateId).Unavailable ||
    TEMPLATE_REGISTRY.classic.Unavailable
  );
}

export function getTemplateCatalog() {
  return Object.values(TEMPLATE_REGISTRY).map(
    ({
      Template,
      Loading,
      Unavailable,
      ...publicMetadata
    }) => publicMetadata
  );
}

export function isCleanCardsTemplate(templateId) {
  return normalizeTemplateId(templateId) === "clean_cards";
}

export function isCafeTemplate(templateId) {
  return normalizeTemplateId(templateId) === "cafe_cozy";
}