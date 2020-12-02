import { Point } from '@t/options';
import { ExportMenuButtonTheme } from '@t/theme';

export type ExportMenuButtonModel = {
  type: 'exportMenuButton';
  opened: boolean;
  theme: Required<ExportMenuButtonTheme>;
} & Point;

export type ExportMenuModel = {
  type: 'exportMenu';
} & Point;

export type ExportMenuModels = { exportMenuButton: ExportMenuButtonModel[] };
