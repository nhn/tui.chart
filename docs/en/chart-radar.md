# Radar Chart

> API information regarding each chart is not addressed in this document. Refer to the [API Guide](./common-api.md).

## Creating the Chart

There are two different ways to create the Radar chart. The Radar chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { RadarChart } from '@toast-ui/chart';

const chart = new RadarChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.radarChart({el, data, options});
```

## Basic Chart

### Data Type

The data is entered as a `series` and must be a pair of `name` and `data`. The `name` is used to identify each series and its id must be unique.

```js
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000],
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000],
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000],
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000],
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/43128697/102769215-ae7d5600-43c5-11eb-9f72-aa1c80e9ceaa.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.

```js
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000],
      visible: false
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000],
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000],
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000],
    },
  ],
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108011957-86b81080-704b-11eb-8b3c-1c8ed2f01326.png)


## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
    //...
  },
  yAxis?: {
    //...
  },
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
    showDot?: boolean;
    showArea?: boolean;
  }
}
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Axis](./common-axes.md),
> [Legend](./common-legend.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
> [Plot](./common-plot.md),
> [`responsive` Options](./common-responsive-options.md)
> )

### selectable

Makes the series selectable.

* default: `false`

```js
const options = {
  series: {
    selectable: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102769686-585ce280-43c6-11eb-8c24-684a6235ad37.png)


`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

### showDot

Displays a dot at the vertex of the series.

* default: `false`

```js
const options = {
  series: {
    showDot: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102770526-a45c5700-43c7-11eb-86da-81281b20f5eb.png)

### showArea

Fills the area of the series.

* default: `false`

```js
const options = {
  series: {
    showArea: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102770930-49772f80-43c8-11eb-871c-0c3d0e7b6cf0.png)

## Series Theme

The following is a list of themes that can be modified in the Radar chart.

```ts
interface RadarChartSeriesTheme {
  colors?: string[];
  areaOpacity?: number;
  lineWidth?: number;
  dashSegments?: number[];
  dot?: {
    color?: string;
    radius?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  select?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
    areaOpacity?: number;
    restSeries?: {
      areaOpacity: number;
    };
  };
}
```

| Name | Type | Details |
| --- | --- | --- |
| `colors` | string[] | The color of the series |
| `areaOpacity` | number | Area opacity when `showArea: true` |
| `lineWidth` | number | Series line width |
| `dashSegments` | number[] | Series line dashSegment value |
| `dot` | object | Styles used for the dot displayed when `showDot: true` |
| `hover.dot` | object | Styles used for the dot when a cursor hovers over the data |
| `select` | object | Styles used for series when `series.selectable: true` and the series is selected |
| `select.dot` | object | Styles used for the dot when the series is selected |
| `select.areaOpacity` | number | Area opacity when `showArea: true` and the series is selected |
| `select.restSeries.areaOpacity` | number | Area opacity of the rest of the series when `showArea: true` and a series is selected |

The theme is configured using the `theme` option, and the series theme is configured using the `theme.series`. The following example changes the style of a series.

```js
const options = {
  theme: {
    series: {
      colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261'],
      lineWidth: 5,
      dashSegments: [10],
      areaOpacity: 0.5,
      dot: {
        radius: 5,
      },
      hover: {
        dot: {
          radius: 6,
          borderWidth: 2,
          borderColor: '#000000',
        },
      },
      select: {
        dot: {
          radius: 6,
          borderWidth: 2,
          borderColor: '#000000',
        },
        restSeries: {
          areaOpacity: 0.01,
        },
        areaOpacity: 1,
      },
    }
  }
}
```

The code above results as shown below.

![image](https://user-images.githubusercontent.com/43128697/102772168-67de2a80-43ca-11eb-9760-480b1978f334.png)
