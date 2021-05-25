import legend from '@src/store/legend';
import { StateFunc } from '@t/store';

it('should apply default options when legend options not exist', () => {
  const state = (legend.state as StateFunc)({
    options: { chart: { width: 800, height: 800 } },
    data: [],
  });

  expect(state.legend).toEqual({
    visible: true,
    align: 'bottom',
    height: 50,
    width: 150,
  });
});

it('should not calculate legend options, when visible options is false', () => {
  const state = (legend.state as StateFunc)({
    options: { chart: { width: 800, height: 800 }, legend: { visible: false } },
    data: [],
  });

  expect(state.legend).toEqual({
    visible: false,
  });
});

describe('legend have different rect depending on the align.', () => {
  it('bottom', () => {
    const state = (legend.state as StateFunc)({
      options: { chart: { width: 800, height: 800 } },
      data: [],
    });

    expect(state.legend).toEqual({
      visible: true,
      align: 'bottom',
      height: 50,
      width: 150,
    });
  });

  it('top', () => {
    const state = (legend.state as StateFunc)({
      options: { chart: { width: 800, height: 800 }, legend: { align: 'top' } },
      data: [],
    });

    expect(state.legend).toEqual({
      visible: true,
      align: 'top',
      height: 50,
      width: 150,
    });
  });

  it('left', () => {
    const state = (legend.state as StateFunc)({
      options: { chart: { width: 800, height: 800 }, legend: { align: 'left' } },
      data: [],
    });

    expect(state.legend).toEqual({
      visible: true,
      align: 'left',
      height: 150,
      width: 50,
    });
  });

  it('right', () => {
    const state = (legend.state as StateFunc)({
      options: { chart: { width: 800, height: 800 }, legend: { align: 'right' } },
      data: [],
    });

    expect(state.legend).toEqual({
      visible: true,
      align: 'right',
      height: 150,
      width: 50,
    });
  });
});
