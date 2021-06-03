import { FontTheme } from '@toast-ui/shared';
import { GeoFeatureResponderModel } from '@t/components/geoFeature';

export type TooltipTheme = {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  body?: FontTheme;
};

export type TooltipTemplateFunc = (
  model: GeoFeatureResponderModel,
  defaultBodyTemplate: string,
  theme: Required<TooltipTheme>
) => string;
