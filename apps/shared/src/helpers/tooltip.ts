import { FontTheme } from '@t/index';

export function getTranslateString(x: number, y: number) {
  return `translate(${x}px,${y}px)`;
}

export function getFontStyleString(theme: FontTheme) {
  const { color, fontSize, fontFamily, fontWeight } = theme;

  return `font-weight: ${fontWeight}; font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${color};`;
}
