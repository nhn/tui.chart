import { Point } from '@t/options';

export type ExportMenuButtonModel = {
  type: 'exportMenuButton';
  opened: boolean;
} & Point;

export type ExportMenuModel = {
  type: 'exportMenu';
} & Point;

export type ExportMenuModels = { exportMenuButton: ExportMenuButtonModel[] };
