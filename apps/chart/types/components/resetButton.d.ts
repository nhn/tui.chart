import { Point } from '../options';

export type ResetButtonModel = {
  type: 'resetButton';
} & Point;

export type ResetButtonModels = ResetButtonModel[];

export type BackButtonModel = {
  type: 'backButton';
} & Point;

export type BackButtonModels = BackButtonModel[];
