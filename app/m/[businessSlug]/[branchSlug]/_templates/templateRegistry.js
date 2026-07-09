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

export function normalizeTemplateId(templateId) {
  const value = String(templateId || "classic").toLowerCase();

  if (value === "modern") return "modern";
  if (value === "luxury") return "luxury";

  if (
    ["clean", "clean_cards", "clean-cards", "template_clean_cards"].includes(
      value
    )
  ) {
    return "clean_cards";
  }

  return "classic";
}

export const TEMPLATE_REGISTRY = {
  classic: {
    id: "classic",
    Template: ClassicTemplate,
    Loading: ClassicLoading,
    Unavailable: ClassicUnavailable,
  },

  modern: {
    id: "modern",
    Template: ModernTemplate,
    Loading: ModernLoading,
    Unavailable: ModernUnavailable,
  },

  luxury: {
    id: "luxury",
    Template: LuxuryTemplate,
    Loading: LuxuryLoading,
    Unavailable: LuxuryUnavailable,
  },

  clean_cards: {
    id: "clean_cards",
    Template: TemplateCleanCards,
    Loading: CleanCardsLoading,
    Unavailable: CleanCardsUnavailable,
  },
};

export function getTemplateBundle(templateId) {
  const cleanId = normalizeTemplateId(templateId);
  return TEMPLATE_REGISTRY[cleanId] || TEMPLATE_REGISTRY.classic;
}

export function getTemplateComponent(templateId) {
  return getTemplateBundle(templateId).Template;
}

export function getTemplateLoading(templateId) {
  return getTemplateBundle(templateId).Loading;
}

export function getTemplateUnavailable(templateId) {
  return getTemplateBundle(templateId).Unavailable;
}

export function isCleanCardsTemplate(templateId) {
  return normalizeTemplateId(templateId) === "clean_cards";
}