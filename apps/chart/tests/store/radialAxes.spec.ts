describe('when chart has radar series', () => {
  it('should be stored the inital radialAxis property', () => {
    const data = [
      { name: 'han', data: [1, 2, 3], rawData: [1, 2, 3], color: '#aaaaaa' },
      { name: 'cho', data: [4, 5, 6], rawData: [4, 5, 6], color: '#bbbbbb' },
    ];

    const series = { radar: { ...data } };
    const options = {} as Options;

    expect(axesStateFunc({ series, options })).toEqual({
      axes: {
        xAxis: {},
        yAxis: {},
      },
    });
  });

  it('should be set radar axis data', () => {
    const state = {
      chart: { width: 210, height: 210 },
      layout: {
        plot: { width: 200, height: 200, x: 10, y: 10 },
        yAxis: { x: 10, y: 10, width: 10, height: 10 },
        xAxis: { x: 10, y: 10, width: 10, height: 10 },
      },
      scale: { yAxis: { limit: { min: 0, max: 8 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        radar: {
          data: [
            { name: 'han', data: [1, 3, 5, 7] },
            { name: 'cho', data: [2, 4, 6, 8] },
          ],
        },
      },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B', 'C', 'D'],
      options: {},
      theme: {
        xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
      },
    } as ChartState<Options>;

    const store = { state } as Store<Options>;
    axes.action!.setAxesData.call({ notify }, store);

    expect(store.state.axes.radialAxis).toMatchObject({
      labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
    });
  });
});
