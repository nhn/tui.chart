export type SectorStyle = {
  lineWidth?: number;
  strokeStyle?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
};

export type SectorStyleName = 'default' | 'hover' | 'nested';
export type CircleStyleName = 'default' | 'plot';
export type RectStyleName = 'shadow';
export type LabelStyleName = 'default' | 'title' | 'axisTitle' | 'rectLabel';
export type StrokeLabelStyleName = 'none' | 'stroke';

export interface LabelStyle {
  font?: string;
  fillStyle?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export type StrokeLabelStyle = {
  lineWidth?: number;
  strokeStyle?: string;
  shadowColor?: string;
  shadowBlur?: number;
};

export type PathRectStyleName = 'shadow';
