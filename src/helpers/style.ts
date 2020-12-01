import { StyleProp } from '@t/components/series';
import { isString, pick } from '@src/helpers/utils';
import { FontTheme, DataLabelWithBubble, DataLabelWithoutBubbleArrow } from '@t/theme';

export function makeStyleObj<T, K>(style: StyleProp<T, K>, styleSet: Record<string, object>) {
  return style.reduce((acc: T, curValue) => {
    if (isString(curValue)) {
      return { ...acc, ...styleSet[curValue] };
    }

    return { ...acc, ...curValue };
  }, {} as T);
}

export function getTitleFontString(fontTheme: FontTheme) {
  const { fontFamily, fontSize, fontWeight } = fontTheme;

  return `${fontWeight} ${fontSize}px ${fontFamily}`;
}

export function getFont(theme: DataLabelWithBubble | DataLabelWithoutBubbleArrow) {
  return getTitleFontString(pick(theme, 'fontFamily', 'fontWeight', 'fontSize'));
}
