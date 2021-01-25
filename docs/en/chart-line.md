# Line Chart

> [API](./common-api.md) information regarding each chart is not addressed in this document. Refer to the API Guide.

## Creating the Chart

There are two different ways to create the Line chart. The Line chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { LineChart } from '@toast-ui/chart';

const chart = new LineChart({ el, data, options });

// or

import Chart from '@toast-ui/chart';

const chart = Chart.lineChart({ el, data, options });
```

There are two ways of providing the information for the `data`. One way is to provide the category values with the corresponding data, and the other is to provide the set of coordinates. Let's take a look at both methods.

## Basic Chart

### Data Type

`categories` values are shown on the x-axis, and the `series` value must be completed with the `name` and the `data`. The `name` is used to identify each series and its id must be unique.

```js
const data = {
  categories: [
    '01/01/2020',
    '02/01/2020',
    '03/01/2020',
    '04/01/2020',
    '05/01/2020',
    '06/01/2020',
    '07/01/2020',
    '08/01/2020',
    '09/01/2020',
    '10/01/2020',
    '11/01/2020',
    '12/01/2020',
  ],
  series: [
    {
      name: 'Seoul',
      data: [-3.5, -1.1, 4.0, 11.3, 17.5, 21.5, 25.9, 27.2, 24.4, 13.9, 6.6, -0.6],
    },
    {
      name: 'Seattle',
      data: [3.8, 5.6, 7.0, 9.1, 12.4, 15.3, 17.5, 17.8, 15.0, 10.6, 6.6, 3.7],
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/35371660/101846479-5f008400-3b94-11eb-8670-198074d97999.png)

## Coordinate Chart

There are two ways to enter the coordinates. First is providing the coordinates in an object form (`{x: value, y: value}`), and the second is providing the coordinates in an array (`[x, y]`).

First let's draw a coordinate chart using the coordinate data in the object form.

```js
const data = {
  series: [
    {
      name: 'SiteA',
      data: [
        { x: 1, y: 202 },
        { x: 7, y: 350 },
        { x: 8, y: 213 },
        { x: 9, y: 230 },
        { x: 12, y: 230 },
      ],
    },
    {
      name: 'SiteB',
      data: [
        { x: 1, y: 312 },
        { x: 3, y: 320 },
        { x: 7, y: 300 },
        { x: 9, y: 320 },
        { x: 13, y: 20 },
      ],
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/35371660/101847254-28c40400-3b96-11eb-8f83-b1abe66704ab.png)

The identical chart can be drawn using data in the array form.

```js
const data = {
  series: [
    {
      name: 'SiteA',
      data: [
        [1, 202],
        [7, 350],
        [8, 213],
        [9, 230],
        [12, 230],
      ],
    },
    {
      name: 'SiteB',
      data: [
        [1, 312],
        [3, 320],
        [7, 300],
        [9, 320],
        [13, 20],
      ],
    },
  ],
};
```

## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
    // ...
  };
  xAxis?: {
    // ...
  };
  yAxis?: {
    // ...
  };
  legend?: {
    // ...
  };
  exportMenu?: {
    // ...
  };
  tooltip?: {
    // ...
  };
  plot?: {
    // ...
  };
  responsive?: {
    // ...
  };
  theme?: {
    // More explanations in the `theme` chapter.
  };
  series?: {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    eventDetectType?: 'near' | 'nearest' | 'grouped';
    shift?: boolean;
    dataLabels?: {
      visible?: boolean;
      anchor?: 'center' | 'start' | 'end' | 'auto' | 'outer';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    };
  };
};
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Axis](./common-axes.md),
> [Legend](./common-legend.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
> [Plot](./common-plot.md),
> [`responsive` Options](./common-responsive-options.md),
> [Live Update](./common-liveUpdate-options.md),
> [Data Label](./common-dataLabels-options.md)
> )

### selectable

![image](https://user-images.githubusercontent.com/35371660/101849744-acccba80-3b9b-11eb-838c-40324d596afb.png)

- default: `false`

Makes the series selectable.

```js
const options = {
  series: {
    selectable: true,
  },
};
```

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

### spline

![image](https://user-images.githubusercontent.com/35371660/101850252-c02c5580-3b9c-11eb-9917-094e35c6b139.png)

- default: `false`

Fits the series into a smooth spline curve.

```js
const options = {
  series: {
    spline: true,
  },
};
```

### eventDetectType

![image](https://user-images.githubusercontent.com/35371660/101850828-e0a8df80-3b9d-11eb-9500-98b351bd007e.png)

- default: `nearest`

Defines ways to detect the data to be displayed on the tool tip.

| Type      | Details                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `near`    | Detects the data when it is within a specified range of the mouse. If there are more than one data sets within a specified range, they are all detected. |
| `nearest` | Event is detected within the entire area of the chart. Only the series that is closest to the mouse is detected.                                         |
| `grouped` | All data that are equal with respect to the x-axis are detected.                                                                                         |
| `point`   | Detected when hovering over the series data point area.                                                                                                  |

```js
const options = {
  series: {
    eventDetectType: 'grouped',
  },
};
```

### zoomable

![zoomable](https://user-images.githubusercontent.com/35371660/105646441-4a2d4500-5ee3-11eb-9cf6-4d5bdd1f77dc.gif)

- default: `false`

zoomable can be used to zoom into the chart.

```js
const options = {
  series: {
    zoomable: true,
  },
};
```

## Series Theme

The following is a list of themes that can be modified in the Line chart.

```ts
interface LineChartSeriesTheme {
  lineWidth?: number;
  dashSegments?: number[];
  colors?: string[];
  dot?: {
    radius?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  select?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  hover?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  dataLabels?: {
    textBubble?: {
      visible?: boolean;
      arrow?: ArrowTheme;
      paddingX?: number;
      paddingY?: number;
      backgroundColor?: string;
      borderRadius?: number;
      borderColor?: string;
      borderWidth?: number;
      shadowColor?: string;
      shadowOffsetX?: number;
      shadowOffsetY?: number;
      shadowBlur?: number;
    };
    useSeriesColor?: boolean;
    lineWidth?: number;
    textStrokeColor?: string;
    shadowColor?: string;
    shadowBlur?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
}
```

| Name         | Type     | Details                                                                                                         |
| ------------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| lineWidth    | number   | The width of the series line                                                                                    |
| dashSegments | number[] | The dashSegment value of the series line (IE11 or higher version supported)                                     |
| colors       | string[] | The color of the series                                                                                         |
| dot          | object   | The style for the dot displayed when `showDot: true`                                                            |
| select       | object   | The style that is applied to the line when the series is selected and the `series.selectable` is set to `true`. |
| select.dot   | object   | The style for the dot displayed when the data is selected                                                       |
| hover        | object   | The style that is applied when the user hovers over the data                                                    |
| dataLabels   | object   | Data label style. For more information, refer to the DataLabels guide.                                          |

The theme can be added through the `theme` value in the options object. For example, let's change the line width and color of a series.

```js
const options = {
  theme: {
    series: {
      lineWidth: 10,
      colors: ['#83b14e', '#458a3f'],
    },
  },
};
```

The result of the above option is shown as shown below.

![image](https://user-images.githubusercontent.com/35371660/101853581-2c11bc80-3ba3-11eb-91d1-75084cb0d042.png)
