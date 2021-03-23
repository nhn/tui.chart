import { StyleProp } from '@t/components/series';
import { isString, pick } from '@src/helpers/utils';
import { FontTheme, BubbleDataLabel, BoxDataLabel } from '@t/theme';
import { getAlpha } from '@src/helpers/color';

export function makeStyleObj<T, K>(style: StyleProp<T, K>, styleSet: Record<string, object>) {
  return style.reduce((acc: T, curValue) => {
    if (isString(curValue)) {
      return { ...acc, ...styleSet[curValue] };
    }

    return { ...acc, ...curValue };
  }, {} as T);
}

export function getTranslateString(x: number, y: number) {
  return `translate(${x}px,${y}px)`;
}

export function getTitleFontString(fontTheme: FontTheme) {
  const { fontFamily, fontSize, fontWeight } = fontTheme;

  return `${fontWeight} ${fontSize}px ${fontFamily}`;
}

export function getFontStyleString(theme: FontTheme) {
  const { color, fontSize, fontFamily, fontWeight } = theme;

  return `font-weight: ${fontWeight}; font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${color};`;
}

export function getFont(theme: BubbleDataLabel | BoxDataLabel) {
  return getTitleFontString(pick(theme, 'fontFamily', 'fontWeight', 'fontSize'));
}

export function setLineDash(ctx: CanvasRenderingContext2D, dashSegments: number[]) {
  if (ctx.setLineDash) {
    ctx.setLineDash(dashSegments);
  }
}

export function getBoxTypeSeriesPadding(tickDistance: number) {
  return Math.floor(tickDistance * 0.15);
}

export function fillStyle(ctx: CanvasRenderingContext2D, fillOption: string) {
  ctx.fillStyle = fillOption;
  ctx.fill();
}

export function strokeWithOptions(
  ctx: CanvasRenderingContext2D,
  style: { strokeStyle?: string; lineWidth?: number }
) {
  const { lineWidth, strokeStyle } = style;

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
  }

  if (lineWidth) {
    ctx.lineWidth = lineWidth;
  }

  if (ctx.lineWidth && getAlpha(String(ctx.strokeStyle))) {
    ctx.stroke();
  }
}
