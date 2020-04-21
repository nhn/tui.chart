import {
  deepCopyArray,
  deepMergedCopy,
  deepCopy,
  range,
  includes,
  pick,
  omit,
  pickProperty,
  pickPropertyWithMakeup,
  sortSeries,
  sortCategories,
  isInteger,
  first,
  last
} from '@src/helpers/utils';
import { Point } from '@t/options';

describe('utils', () => {
  it('deepCopy', () => {
    const obj = { a: 1, b: { c: 1 } };
    const copiedObj = deepCopy(obj);

    copiedObj.a = 2;
    expect(obj.a).toEqual(1);
    expect(copiedObj).toEqual({ a: 2, b: { c: 1 } });
  });

  it('deepCopyArray', () => {
    const arr = [1, 2, 3, 4];
    const copiedArr = deepCopyArray(arr);

    copiedArr.push(5);
    expect(arr).toEqual([1, 2, 3, 4]);
    expect(copiedArr).toEqual([1, 2, 3, 4, 5]);
  });

  it('deepMergedCopy', () => {
    const obj1 = { a: { b: { d: 2 } }, c: 1 };
    const obj2 = { a: { b: { e: { f: 1 } } }, c: 2 };

    expect(deepMergedCopy(obj1, obj2)).toEqual({ a: { b: { d: 2, e: { f: 1 } } }, c: 2 });
  });

  it('range', () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(2, 5)).toEqual([2, 3, 4]);
    expect(range(0, 5, 2)).toEqual([0, 2, 4]);
  });

  it('includes', () => {
    expect(includes([1, 2, 3], 1)).toBe(true);
    expect(includes([1, 2, 3], 1, 2)).toBe(false);
    expect(includes([1, 2, 3], 1, 0)).toBe(true);
  });

  it('pick', () => {
    const obj = { a: 1, b: { c: 2 }, d: 2 };

    expect(pick(obj, 'a', 'd')).toEqual({ a: 1, d: 2 });
  });

  it('omit', () => {
    const obj = { a: 1, b: { c: 2 }, d: 2 };

    expect(omit(obj, 'a', 'd')).toEqual({ b: { c: 2 } });
  });

  it('pickProperty', () => {
    const obj = { a: 1, b: { c: 2 }, d: 2 };

    expect(pickProperty(obj, ['b', 'c'])).toEqual(2);
  });

  it('pickPropertyWithMakeup', () => {
    const obj = { a: 1, b: { c: 2 }, d: 2 };

    expect(pickPropertyWithMakeup(obj, ['b', 'd'])).toEqual({});
  });

  it('sortSeries', () => {
    const arr: [number, number][] = [
      [10, 2],
      [1, 2],
      [3, 5],
      [2, 4]
    ];
    const dateArr: [string, number][] = [
      ['02/20/2020 10:00:00', 1],
      ['02/23/2020 09:00:00', 3],
      ['02/20/2020 10:10:00', 1]
    ];
    const point: Point[] = [
      { x: 10, y: 3 },
      { x: 3, y: 5 },
      { x: 5, y: 10 }
    ];

    expect(arr.sort(sortSeries)).toEqual([
      [1, 2],
      [2, 4],
      [3, 5],
      [10, 2]
    ]);

    expect(dateArr.sort(sortSeries)).toEqual([
      ['02/20/2020 10:00:00', 1],
      ['02/20/2020 10:10:00', 1],
      ['02/23/2020 09:00:00', 3]
    ]);

    expect(point.sort(sortSeries)).toEqual([
      { x: 3, y: 5 },
      { x: 5, y: 10 },
      { x: 10, y: 3 }
    ]);
  });

  it('sortCategories', () => {
    const arr = [10, 2, 4];
    const dateArr = ['02/23/2020 09:00:00', '02/20/2020 10:00:00', '02/20/2020 10:10:00'];

    expect(arr.sort(sortCategories)).toEqual([2, 4, 10]);
    expect(dateArr.sort(sortCategories)).toEqual([
      '02/20/2020 10:00:00',
      '02/20/2020 10:10:00',
      '02/23/2020 09:00:00'
    ]);
  });

  it('isInteger', () => {
    expect(isInteger(0)).toBe(true);
    expect(isInteger(-1)).toBe(true);
    expect(isInteger(1.3)).toBe(false);
  });

  it('first', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const emptyArr = [];

    expect(first(arr)).toBe(0);
    expect(first(emptyArr)).toBeUndefined();
  });

  it('last', () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const emptyArr = [];

    expect(last(arr)).toBe(10);
    expect(first(emptyArr)).toBeUndefined();
  });
});
