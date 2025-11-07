import type { ColorOption } from "../utils/imageUtils";

export interface ProcessingOptions {
  selectedColor: ColorOption;
  borderSize: number;
  borderEnabled: boolean;
  invertEnabled: boolean;
  cropEnabled: boolean;
  horizontalPadding: number;
  smoothBlend: boolean;
  increaseContrast: boolean;
  removeBackground: boolean;
}
