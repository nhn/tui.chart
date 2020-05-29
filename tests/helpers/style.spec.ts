import { makeStyleObj } from '@src/helpers/style';

describe('style', () => {
  it('makeStyleObj', () => {
    const styleSet = {
      a: {
        b: 'test',
      },
      c: {
        d: 'test2',
      },
    };

    expect(makeStyleObj(['a', 'c', { d: 'test3' }], styleSet)).toEqual({
      b: 'test',
      d: 'test3',
    });
  });
});
