# LineScatter Chart

> [API](./common-api.md) information regarding each chart is not addressed in this document. Refer to the API Guide.

## Creating the Chart

There are two different ways to create the Line Scatter chart. The Line Scatter chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { LineScatterChart } from '@toast-ui/chart';

const chart = new LineScatterChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.lineScatterChart({el, data, options});
```

## Basic Chart

### Data Type

The data is entered as a `series`. Each chart's series is provided to the `scatter` and `line`, respectively, and must be completed with both `name` and `data`. The data must either be a set of `x` and `y` coordinates or an array of coordinates.

```js
const data = {
  series: {
    scatter: [
      {
        name: 'Efficiency',
        data: [
          { x: 10, y: 20 },
          { x: 14, y: 30 },
          { x: 18, y: 10 },
          { x: 20, y: 30 },
          { x: 22, y: 50 },
          { x: 24, y: 55 },
          { x: 25, y: 75 },
        ],
      },
    ],
    line: [
      {
        name: 'Expenses',
        data: [
          { x: 5, y: 5 },
          { x: 10, y: 50 },
          { x: 15, y: 25 },
          { x: 25, y: 90 },
        ],
      },
    ],
  },
}

// or

const data = {
  series: {
    scatter: [
      {
        name: 'Efficiency',
        data: [
          [10, 20],
          [14, 30],
          [18, 10],
          [20, 30],
          [22, 50],
          [24, 55],
          [25, 75],
        ],
      },
    ],
    line: [
      {
        name: 'Expenses',
        data: [
          [5, 5],
          [10, 50],
          [15, 25],
          [25, 90],
        ],
      },
    ],
  },
}
```

![image](https://user-images.githubusercontent.com/35371660/102061607-0866a480-3e37-11eb-92bb-eaf79c7e99f6.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.

```js
const data = {
  series: {
    scatter: [
      {
        name: 'Efficiency',
        data: [
          { x: 10, y: 20 },
          { x: 14, y: 30 },
          { x: 18, y: 10 },
          { x: 20, y: 30 },
          { x: 22, y: 50 },
          { x: 24, y: 55 },
          { x: 25, y: 75 },
        ],
        visible: false
      },
    ],
    line: [
      {
        name: 'Expenses',
        data: [
          { x: 5, y: 5 },
          { x: 10, y: 50 },
          { x: 15, y: 25 },
          { x: 25, y: 90 },
        ],
      },
    ],
  },
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108011159-dac1f580-7049-11eb-84d1-1fc93138f6d6.png)


## Options

`options` should be used as an object. Options for each chart can be applied through `line` and `scatter`. The available options are as follows.

```ts
type options = {
  chart?: {
    //...
  }
  xAxis?: {
    //...
  }
  yAxis?: {
    //...
  }
  legend?: {
    //...
  }
  exportMenu?: {
    //...
  }
  tooltip?: {
    //...
  }
  responsive?: {
    //...
  }
  theme?: {
    // More explanations in the `theme` chapter.
  }
  series?: {
    selectable?: boolean;
    line?: {
      spline?: boolena;
      showDot?: boolean;
    }
    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: Formatter;
    }
  }
}
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide. Furthermore, for information regarding scatter and line charts options, refer to the respective guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Axis](./common-axes.md),
> [Legend](./common-legend.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
> [`responsive` Options](./common-responsive-options.md),
> [Live Update](./common-liveUpdate-options.md),
> [Line Chart](./chart-line.md),
> [Scatter Chart](./chart-scatter.md),
> )

### selectable

![image](https://user-images.githubusercontent.com/35371660/102150192-58834c80-3eb3-11eb-8eed-708807aca1cc.png)

* default: `false`

Makes the series selectable.

```js
const options = {
  series: {
    selectable: true
  }
};
```

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

### line chart options

To apply the line chart's `spline` option and the `showDot` option, define the options in the `line` attribute.

```js
const options = {
  line: {
    showDot: true,
    spline: true
  }
};
```

![image](https://user-images.githubusercontent.com/35371660/102150429-e2cbb080-3eb3-11eb-9698-ecdf53baf5ae.png)

### dataLabels options

If the `series.dataLabels` option is configured, the data labels are displayed for Line charts. Scatter chart does not support data label option.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477790-5dc61e00-4e05-11eb-94cd-6209948ad291.png)

Each `series` option can have its own series options, and options related to data labels can be defined in greater detail.

```ts
type LineScatterChartSeriesOption = {
  line: { // Line series options
    ...
    dataLabels: {
      // Line series data label options
    }
  }
};
```

## Series Theme

To apply different styles for two charts, use `series.line` or `series.scatter` to define the themes. The `color` can be used to define a common color for two charts, or different colors can be applied using the `line` and `scatter` attributes.

```ts
interface LineScatterChartSeriesTheme {
  colors: string[];
  line: {
    // themes for line chart series
  };
  scatter: {
    // themes for scatter chart series
};
```

Let's apply some styles to the charts, for example.

```js
const theme = {
  theme: {
    series: {
      colors: ['#ff3322', '#bbcc22'],
      line: {
        dot: {
          borderColor: '#009dff',
          borderWidth: 2,
          radius: 7,
        },
      },
      scatter: {
        borderWidth: 1,
        iconTypes: ['star'],
      },
    },
  },
};
```

The result is as shown below.

![image](https://user-images.githubusercontent.com/35371660/102152124-b7e35b80-3eb7-11eb-890a-8e487c02b02b.png)

When defining styles for line series' data label, use `series.line.dataLabels`.

```ts
type LineScatterChartDataLabelTheme = {
  series: {
    line: {
      dataLabels: {
        // Line series data label themes
      }
    }
  }
};
```

The code below applies a theme to the data label to use text bubbles and to change the text styles for Line series.

```js
const options = {
  series: {
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: -15 }
    }
  },
  theme: {
    series: {
      line: {
        dataLabels: {
          color: '#105018',
          fontSize: 10,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'bottom'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477907-7c78e480-4e06-11eb-9d40-00759bcf65c3.png)


> Themes for [Line Chart](./chart-line.md) and [Scatter Chart](./chart-scatter.md) can be found in respective guides.
