import { StyleProp } from '@t/components/series';
import { isString } from '@src/helpers/utils';

export function makeStyleObj<T, K>(
  style: StyleProp<T, K>,
  styleSet: Record<string, object>
) {
  return style.reduce((acc: T, curValue) => {
    if (isString(curValue)) {
      return { ...acc, ...styleSet[curValue] };
    }

    return { ...acc, ...curValue };
  }, {} as T);
}
