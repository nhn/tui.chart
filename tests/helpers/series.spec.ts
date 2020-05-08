import { makeStackData, makeStackGroupData, initializeStack } from '@src/helpers/series';
import { StackInfo } from '@t/options';

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

  expect(makeStackData(rawData)).toEqual(result);
});

it('makeStackGroupData', () => {
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

  expect(makeStackGroupData(rawData)).toEqual(result);
});

it('initializeStack', () => {
  const booleanOnly = true;

  const result1 = {
    type: 'normal',
    connector: false
  };

  expect(initializeStack(booleanOnly)).toEqual(result1);

  const connectorBooleanOnly = {
    type: 'normal',
    connector: true
  } as StackInfo;

  const result2 = {
    type: 'normal',
    connector: {
      type: 'solid',
      color: 'rgba(51, 85, 139, 0.3)',
      width: 1
    }
  };

  expect(initializeStack(connectorBooleanOnly)).toEqual(result2);

  const definedConnectorTypeOnly = {
    type: 'percent',
    connector: {
      type: 'dashed'
    }
  } as StackInfo;

  const result3 = {
    type: 'percent',
    connector: {
      type: 'dashed',
      color: 'rgba(51, 85, 139, 0.3)',
      width: 1
    }
  };

  expect(initializeStack(definedConnectorTypeOnly)).toEqual(result3);

  const definedConnectorObject = {
    type: 'normal',
    connector: {
      type: 'dashed',
      color: '#ff0000',
      width: 1
    }
  } as StackInfo;

  const result4 = {
    type: 'normal',
    connector: {
      type: 'dashed',
      color: '#ff0000',
      width: 1
    }
  };

  expect(initializeStack(definedConnectorObject)).toEqual(result4);
});
