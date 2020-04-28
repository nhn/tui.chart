import { getStackData } from '@src/helpers/series';

describe('helpers/series', () => {
  it('getStackData', () => {
    const rawData = [
      {
        name: 'test1',
        data: [1000, 2000, 3000]
      },
      {
        name: 'test2',
        data: [2000, 4000, 6000]
      }
    ];

    const result = [
      {
        values: [1000, 2000],
        sum: 3000
      },
      {
        values: [2000, 4000],
        sum: 6000
      },
      {
        values: [3000, 6000],
        sum: 9000
      }
    ];

    expect(getStackData(rawData)).toEqual(result);
  });
});
