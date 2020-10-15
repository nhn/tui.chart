import theme from '@src/store/theme';
import { StateFunc } from '@t/store/store';

describe('theme store', () => {
  describe('state', () => {
    describe('line', () => {
      const series = {
        line: [
          { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5], color: '#00a9ff' },
          { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4], color: '#ffb840' },
        ],
      };

      it('default theme', () => {
        const state = (theme.state as StateFunc)({ options: {}, series });

        expect(state.theme).toEqual({
          chart: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: '500',
            },
          },
          series: { line: { colors: ['#00a9ff', '#ffb840'] } },
        });
      });

      it('theme options is reflected in the default theme option', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                colors: ['#aaaaaa', '#bbbbbb'],
              },
            },
          },
          series,
        });

        expect(state.theme).toEqual({
          chart: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: '500',
            },
          },
          series: {
            line: { colors: ['#aaaaaa', '#bbbbbb'] },
          },
        });
      });
    });

    describe('line area combo chart', () => {
      const series = {
        line: [
          { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5], color: '#00a9ff' },
          { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4], color: '#ffb840' },
        ],
        area: [
          { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5], color: '#00a9ff' },
          { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4], color: '#ffb840' },
        ],
      };

      it('default theme', () => {
        const state = (theme.state as StateFunc)({ options: {}, series });

        expect(state.theme).toEqual({
          chart: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: '500',
            },
          },
          series: {
            line: { colors: ['#00a9ff', '#ffb840'] },
            area: { colors: ['#ff5a46', '#00bd9f'] },
          },
        });
      });

      it('Common options affect all charts.', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                colors: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd'],
              },
            },
          },
          series,
        });
        expect(state.theme?.series).toEqual({
          area: { colors: ['#cccccc', '#dddddd'] },
          line: { colors: ['#aaaaaa', '#bbbbbb'] },
        });
      });

      it('theme options is reflected in the default theme option', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                area: {
                  colors: ['#aaaaaa', '#bbbbbb'],
                },
                line: {
                  colors: ['#cccccc', '#dddddd'],
                },
              },
            },
          },
          series,
        });
        expect(state.theme?.series).toEqual({
          area: { colors: ['#aaaaaa', '#bbbbbb'] },
          line: { colors: ['#cccccc', '#dddddd'] },
        });
      });
    });

    describe('nested pie chart', () => {
      const series = {
        pie: [
          {
            name: 'A',
            data: [
              {
                name: 'C',
                data: 1,
              },
              {
                name: 'S',
                data: 2,
              },
            ],
          },
          {
            name: 'B',
            data: [
              {
                name: 'CA',
                parentName: 'C',
                data: 3,
              },
              {
                name: 'CB',
                parentName: 'C',
                data: 4,
              },
              {
                name: 'SA',
                parentName: 'S',
                data: 5,
              },
            ],
          },
        ],
      };

      it('default theme', () => {
        const state = (theme.state as StateFunc)({ options: {}, series });

        expect(state.theme).toEqual({
          chart: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: '500',
            },
          },
          series: {
            pie: {
              A: {
                colors: ['#00a9ff', '#ffb840'],
              },
              B: {
                colors: ['#ff5a46', '#00bd9f', '#785fff'],
              },
            },
          },
        });
      });

      it('Common options affect all charts.', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                colors: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd', '#eeeeee'],
              },
            },
          },
          series,
        });

        expect(state.theme?.series).toEqual({
          pie: {
            A: {
              colors: ['#aaaaaa', '#bbbbbb'],
            },
            B: {
              colors: ['#cccccc', '#dddddd', '#eeeeee'],
            },
          },
        });
      });

      it('theme options is reflected in the default theme option', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                A: {
                  colors: ['#aaaaaa', '#bbbbbb'],
                },
                B: {
                  colors: ['#cccccc', '#dddddd', '#eeeeee'],
                },
              },
            },
          },
          series,
        });

        expect(state.theme?.series).toEqual({
          pie: {
            A: {
              colors: ['#aaaaaa', '#bbbbbb'],
            },
            B: {
              colors: ['#cccccc', '#dddddd', '#eeeeee'],
            },
          },
        });
      });
    });
  });
});
