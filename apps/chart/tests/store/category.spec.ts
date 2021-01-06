import category from '@src/store/category';
import { StateFunc } from '@t/store/store';

describe('Category Store', () => {
  describe('state', () => {
    it('should make categories from param', () => {
      const state = (category.state as StateFunc)({
        categories: ['a', 'b', 'c'],
        options: {},
        series: {},
      });

      expect(state.categories).toEqual(['a', 'b', 'c']);
    });

    it('should make categories with coordinate data', () => {
      let state = (category.state as StateFunc)({
        options: {
          chart: {
            width: 1,
            height: 2,
          },
        },
        series: {
          line: [
            {
              name: 'test',
              data: [
                { x: 10, y: 5 },
                { x: 1, y: 2 },
                { x: 3, y: 5 },
              ],
              rawData: [
                { x: 10, y: 5 },
                { x: 1, y: 2 },
                { x: 3, y: 5 },
              ],
              color: '#aaaaaa',
            },
          ],
        },
      });

      expect(state.categories).toEqual(['1', '3', '10']);

      state = (category.state as StateFunc)({
        options: {
          chart: {
            width: 1,
            height: 2,
          },
        },
        series: {
          line: [
            {
              name: 'test',
              data: [
                [10, 5],
                [1, 2],
                [3, 5],
              ],
              rawData: [
                [10, 5],
                [1, 2],
                [3, 5],
              ],
              color: '#aaaaaa',
            },
          ],
        },
      });

      expect(state.categories).toEqual(['1', '3', '10']);
    });

    it('should make categories with series names on bullet chart', () => {
      const state = (category.state as StateFunc)({
        options: {
          chart: {
            width: 1,
            height: 2,
          },
        },
        series: {
          bullet: [
            {
              name: 'han',
              data: 0,
              markers: [],
              ranges: [],
              color: '#aaaaaa',
            },
            {
              name: 'cho',
              data: 0,
              markers: [],
              ranges: [],
              color: '#bbbbbb',
            },
          ],
        },
      });

      expect(state.categories).toEqual(['han', 'cho']);
    });
  });
});
