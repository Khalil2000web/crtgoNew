import ClassicTemplate from "./classic/ClassicTemplate";
import ModernTemplate from "./modern/ModernTemplate";
import LuxuryTemplate from "./luxury/LuxuryTemplate";
import TemplateCleanCards from "./clean-cards/TemplateCleanCards";
import CafeTemplate from "./cafe/CafeTemplate";

import {
  normalizeTemplateId,
} from "../publicMenuData";

const TEMPLATE_COMPONENTS = {
  classic:
    ClassicTemplate,

  modern:
    ModernTemplate,

  luxury:
    LuxuryTemplate,

  clean_cards:
    TemplateCleanCards,

  cafe_cozy:
    CafeTemplate,
};

export function getTemplateComponent(
  templateId,
) {
  const normalized =
    normalizeTemplateId(
      templateId,
    );

  return (
    TEMPLATE_COMPONENTS[
      normalized
    ] ||
    TEMPLATE_COMPONENTS.classic
  );
}

export {
  TEMPLATE_COMPONENTS,
};