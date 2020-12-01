import { Point } from '@t/options';
import { ExportMenuTheme } from '@t/theme';

export type ExportMenuButtonModel = {
  type: 'exportMenuButton';
  opened: boolean;
  theme: ExportMenuTheme;
} & Point;

export type ExportMenuModel = {
  type: 'exportMenu';
} & Point;

export type ExportMenuModels = { exportMenuButton: ExportMenuButtonModel[] };
