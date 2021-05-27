# API

### on()
* Compatible with: `All`

```ts
public on(eventName: 'clickLegendLabel'
| 'clickLegendCheckbox'
| 'selectSeries'
| 'unselectSeries'
| 'hoverSeries'
| 'unhoverSeries'
| 'zoom'
| 'resetZoom', handler: (evt: any) => void): void;
```

The `on()` API enables the user defined event to trigger when a certain condition is met. It takes in the event name (`eventName`) and the event that is triggered when a certain condition is met as its parameters. The following is a list of events provided, currently.

| eventName | Details |
| --- | --- |
| `clickLegendLabel` | Triggered when the legend's label area is clicked. |
| `clickLegendCheckbox` | Triggered when the legend's checkbox area is clicked. |
| `selectSeries` | Triggered when the series is selected. Requires `options.series.selectable: true`. |
| `unselectSeries` | Triggered when the series is unselected. Requires `options.series.selectable: true`. |
| `hoverSeries` | Triggered when the mouse hovers over a series. |
| `unhoverSeries` | Triggered when the mouse leaves the series after the `hoverSeries` event. |
| `zoom` | Triggered when zoomed. Requires `options.series.zoomable: true`. |
| `resetZoom` | Triggered when zoom is reset. Requires `options.series.zoomable:true`. |


The following is an example of adding a user defined event to the area chart's series clicked event. The information provided through the event is available in the user defined function.

```js
const chart = new LineChart({ el, data, options });

chart.on('selectSeries', (ev) => {
  console.log(ev);
  /*
  {area: [
    {data: [...], color: '...', name: '...', seriesIndex: '...', index: '...'}
  ]}
   */
});
```

### destroy()
* Compatible with: `All`

```ts
public destroy(): void;
```

Destroys the chart instance.

```js
const chart = new LineChart({ el, data, options });

chart.destroy();
```

### resize()
* Compatible with: `All`

```ts
public resize(size: {
  width?: number;
  height?: number;
}): void;
```

Resizes the canvas on which the chart is drawn.

```js
const chart = new LineChart({ el, data, options });

chart.resize({width: 400, height: 400});
```

### addSeries()
* Compatible with: `All`

```ts
public addSeries(data: SeriesDataInput, seriesDataInfo?: {
  category?: string
  chartType?: string;
}): void;
```

`addSeries()` API is called when a new series is added. It takes the to-be-added series as its first parameter and the additional information regarding the new series as its second parameter. The data type must be identical to the data types of chart's the existing data.

Let's add a new series to the LineChart, for example.

```js
const chart = new LineChart({ el, data, options });

chart.addSeries({
  name: 'newSeries',
  data: [10, 100, 50, 40, 70, 55, 33, 70, 90, 110],
});
```

The second parameter, additional information, can include `category` and the `chartType`.

First, as for the `category`, it is used in the `Heatmap Chart` and adds the data that corresponds to the Y Category. The following code is an example of using the `addSeries()` with the Heatmap chart.

```js
chart.addSeries([-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 24.9, 25.2, 20.4, 13.9, 6.6, -0.6], {
  category: 'newSeries',
});
```

Secondly, the `chartType` is used in charts such as `ColumnLine`, `LineArea`, `LineScatter`, and `NestedPie`, and for `NestedPie`, the `alias` must be included for it to function properly. The following code is an example of using the `addSeries()` with the `LineArea` chart.

```js
const chart = new LineAreaChart({ el, data, options });

chart.addSeries(
  {
    name: 'new series',
    data: [72, 80, 110, 107, 126, 134, 148],
  },
  { chartType: 'line' }
);
```


### setData()
* Compatible with: `All`

```ts
public setData(data): void;
```

`setData()` API changes the chart's data entirely. The data type is identical to the data type that is used to draw the corresponding chart.

The following is an example of using the `setData` with the Line chart.

```js
const lineChart = new LineChart({ el, data, options });

lineChart.setData({
  categories: ['1','2','3'],
  series: [
    {
      name: 'new series',
      data: [1, 2, 3],
    },
    {
      name: 'new series2',
      data: [4, 5, 6],
    }
  ]
});
```

### addData()
* Compatible with: `Line`, `Area`, `Bar`, `BoxPlot`, `Column`, `Heatmap`, `Bubble`, `Scatter`, `Bullet`, `Radar`, `Treemap`, `LineArea`, `LineScatter`, `ColumnLine`

```ts
public addData(data, category?: string): void;
public addData(data, category: string, chartType: 'line' | 'area' | 'column'): void;
```

`addData()` API adds new data based on the existing data. It can be used with Live Update to display adding of the data synchrnously. The data is added to the `end` of the series and is entered as an `array`.

First, let's take a look at an example of using the `addData` with a Line chart.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70],
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70],
    },
  ],
};

const lineChart = new LineChart({ el, data, options });

lineChart.addData([10, 20], '6');
```

The example above will be changed to a Line chart with the following data.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5', '6'], // '6' added
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70, 10], // 10 added
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70, 20], // 20 added
    },
  ],
};
```

Next, let's take a look at using a simple example of using the `addData()` with the LineArea chart.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: {
    line: [
      {
        name: 'A',
        data: [10, 100, 50, 40, 70],
      },
    ],
    area: [
      {
        name: 'B',
        data: [60, 40, 10, 33, 70],
      },
    ],
  },
};

const chart = new LineAreaChart({ el, data, options });

lineAreaChart.addData([10], '6', { chartType: 'line' });
```

Charts like LineArea chart or the LineColumn chart that display multiple charts at once must include the third parameter, `chartType`.

The example above will be changed to a LineArea chart with the following data.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5', '6'],
  series: {
    line: [
      {
        name: 'A',
        data: [10, 100, 50, 40, 70, 10],
      },
    ],
    area: [
      {
        name: 'B',
        data: [60, 40, 10, 33, 70],
      },
    ],
  },
};
```


### setOptions()
* Compatible with: `All`

```ts
public setOptions(options: Options): void;
```

`setOptions()` API changes the chart's options entirely. The option type must be identical to the option type of the option used to draw the chart.

Let's take a look at an example of using `setOptions()` with a Line chart.

```js
const chart = new LineChart({ el, data, options });

chart.setOptions({
  chart: {
    width: 500,
    height: 'auto',
    title: 'Energy Usage',
  },
  xAxis: {
    title: 'Month',
    date: { format: 'yy/MM' },
  },
  yAxis: {
    title: 'Energy (kWh)',
  },
  series: {
    selectable: true
  },
  tooltip: {
    formatter: (value) => `${value}kWh`,
  },
});
```

### updateOptions()
* Compatible with: `All`

```ts
public updateOptions(options: Options): void;
```

`updateOptions()` API updates the original chart's options entirely. The `setOptions()` API removes the original options, but the `updateOptions()` simply updates the changed options with respect to the original options.

Let's take a look at an example of using `updateOptions()` with a Line chart.

```ts
const chart = new LineChart({ el, data, options });

chart.updateOptions({
  xAxis: {
    title: 'Month',
    date: { format: 'yy/MM' },
  },
  tooltip: {
    formatter: (value) => `${value}kWh`,
  },
})
```

### getOptions()
* Compatible with: `All`

```ts
public getOptions(): Options;
```

`getOptions()` returns the options applied to the chart. If the chart's options have been affected by `setOptions()` or `updateOptions()`, the modified options are returned.

### getCheckedLegend()
* Compatible with: `All`

```ts
public getCheckedLegend(): { chartType: ChartType; label: string; checked: boolean; }[]
```

`getCheckedLegend()` returns the information regarding the series of which the legend's checkbox area is clicked.


### setTooltipOffset()
* Compatible with: `All`

```ts
public setTooltipOffset({ x?: number; y?: number });
```

`setTooltipOffset()` moves the tooltip's location in x and y direction with respect to the original location.

```ts
const chart = new LineChart({ el, data, options });

chart.setTooltipOffset({
  x: 30,
  y: -100
});
```

![image](https://user-images.githubusercontent.com/35371660/102179647-dca4f680-3eea-11eb-940d-2fd87dff0434.png)


## showSeriesDataLabel()
* Compatible with: `Line`, `Area`, `Bar`, `Column`, `Pie`, `Heatmap`, `Bullet`, `Treemap`, `NestedPie`, `LineArea`, `ColumnLine`

```ts
public showSeriesDataLabel();
```

`showSeriesDataLabel()` displays the chart's dataLabel.

### hideSeriesDataLabel()
* Compatible with: `Line`, `Area`, `Bar`, `Column`, `Pie`, `Heatmap`, `Bullet`, `Treemap`, `NestedPie`, `LineArea`, `ColumnLine`

```ts
public hideSeriesDataLabel();
```

`hideSeriesDataLabel()` hides the chart's dataLabel.

### addPlotLine()
* Compatible with: `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public addPlotLine(data: {value: number | string, color: string, id?: string});
```

`addPlotLine()` can be used to add a new plot line. Then if the user wants to remove the newly added line using the `removePlotLine()`, the `id` must be passed as its argument.

> For more information regarding [plot line](./common-plot.md) refer to the guide.

### removePlotLine()
* Compatible with:  `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public removePlotLine(id: string);
```

`removePlotLine()` can be used to remove the plot line. It takes the id of the to-be-removed plot as its parameter and it removes the plot line with the given id.

> For more information regarding [plot line](./common-plot.md) refer to the guide.

### addPlotBand()
* Compatible with: `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public addPlotBand(data: {
  range: [number, number] | [string, string],
  color: string,
  id?:string
});
```

`addPlotBand` can be used to add a new plot band. Then, if the user wants to remove the band using `removePlotBand()`, it takes the `id` of the to-be-removed band as its argument.

> For more information regarding [plot band](./common-plot.md) refer to the guide.

### removePlotBand()
* Compatible with: `Line`, `Area`, `LineArea`, `ColumnLine`

```ts
public removePlotBand(id: string);
```

`removePlotBand` can be used to remove the plot band. It takes the id of the to-be-removed plot as its parameter and it removes the plot band with the given id.

> [plot band](./common-plot.md)에 대해 궁금하다면 해당 가이드를 참고하라

> For more information regarding [plot band](./common-plot.md) refer to the guide.


### showTooltip()
`showTooltip` displays the tooltip related to the series.

```ts
public showTooltip(seriesInfo: {
  seriesIndex?: number;
  index?: number;
  alias?: string;
  chartType?: 'line' | 'column' | 'area' | 'scatter';
});
```

The `seriesIndex` parameter refers to the index of the series, and the `index` refers to the index within the series. Each numeric index is used to determine the series for which the tooltip is shown. `alias` is used for NestedPie, and `chartType` is used for ColumnLine, LineArea, and LineScatter charts.

### hideTooltip()

`hideTooltip()` hides the tooltip.

```ts
public hideTooltip();
```

### selectSeries()

`selectSeries()` allows users to select the series given that the `options.series.selectable: true`.

```ts
public selectSeries(seriesInfo: {
  seriesIndex?: number;
  index?: number;
  alias?: string;
  chartType?: 'line' | 'column' | 'area';
});
```

The `seriesIndex` parameter refers to the index of the series, and the `index` refers to the index within the series. Each numeric index is used to determine the series for which the tooltip is shown. `alias` is used for NestedPie, and `chartType` is used for ColumnLine, LineArea, and LineScatter charts.

Upon selection, `selectSeries` eventName from the API's on event can be used for further control over the selected series.

### unselectSeries()

`unselectSeries` unselects the series.

```ts
public unselectSeries();
```

Upon selection, `unselectSeries` eventName from the API's on event can be used for further control over the selected series.

### addOutlier()
* Compatible with: `BoxPlot`

```ts
public addOutlier(seriesIndex: number, outliers: number[][])
```

Using `addOutlier`, you can add new outlier data to the BoxPlot chart.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70],
      outliers: [
        [0, 10],
        [2, 60],
        [3, 80],
      ],
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70],
      outliers: [
        [0, 20]
      ]
    },
  ],
};

const boxPlotChart = new BoxPlotChart({ el, data, options });

boxPlotChart.addOutlier(1, [[1, 50], [3, 30]]);
```

The example above will be changed to a BoxPlot chart with the following data.

```ts
const data = {
  categories: ['1', '2', '3', '4', '5'],
  series: [
    {
      name: 'A',
      data: [10, 100, 50, 40, 70],
      outliers: [
        [0, 10],
        [2, 60],
        [3, 80],
      ],
    },
    {
      name: 'B',
      data: [60, 40, 10, 33, 70],
      outliers: [
        [0, 20]
        [1, 50],
        [3, 30],
      ],
    },
  ],
};
```
