import { getStackData, getStackGroupData } from '@src/helpers/series';

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

it('getStackGroupData', () => {
  const rawData = [
    {
      name: 'test1',
      data: [1000, 2000, 3000],
      stackGroup: 'A'
    },
    {
      name: 'test2',
      data: [2000, 4000, 6000],
      stackGroup: 'B'
    },
    {
      name: 'test3',
      data: [3000, 4000, 5000],
      stackGroup: 'A'
    },
    {
      name: 'test4',
      data: [4000, 1000, 1000],
      stackGroup: 'B'
    }
  ];

  const result = {
    A: [
      { values: [1000, 3000], sum: 4000 },
      { values: [2000, 4000], sum: 6000 },
      { values: [3000, 5000], sum: 8000 }
    ],
    B: [
      { values: [2000, 4000], sum: 6000 },
      { values: [4000, 1000], sum: 5000 },
      { values: [6000, 1000], sum: 7000 }
    ]
  };

  expect(getStackGroupData(rawData)).toEqual(result);
});
