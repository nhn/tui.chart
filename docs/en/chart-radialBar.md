# RadialBar Chart

> API information regarding each chart is not addressed in this document. Refer to the [API Guide](./common-api.md).

## Creating the Chart

There are two different ways to create the RadialBar chart. The RadialBar chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { RadialBarChart } from '@toast-ui/chart';

const chart = new RadialBarChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.radialBarChart({el, data, options});
```

## Basic Chart

### Data Type

`categories` values are shown on the y-axis, and the `series` value must be completed with the `name` and the `data`. The `name` is used to identify each series and its id must be unique.

```js
const data = {
  categories: ['Korea', 'United States', 'Germany', 'Canada', 'Austria'],
  series: [
    {
      name: 'Gold medals',
      data: [132, 105, 92, 73, 64]
    },
    {
      name: 'Silver medals',
      data: [125, 110, 86, 64, 81]
    },
    {
      name: 'Bronze medals',
      data: [111, 90, 60, 62, 87]
    }
  ]
};
```

![radial-bar-basic](https://user-images.githubusercontent.com/43128697/107403382-64545d80-6b48-11eb-8c85-e2b433ad7a74.png)

## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
    //...
  }
  verticalAxis?: {
    label?: {
      interval?: number;
      formatter?: (value: string, axisLabelInfo: { axisName: AxisType; labels: string[]; index: number }) => string;
      margin?: number;
    };
    tick?: {
      interval?: number;
    };
  }
  circularAxis?: {
    label?: {
      interval?: number;
      formatter?: (value: string, axisLabelInfo: { axisName: AxisType; labels: string[]; index: number }) => string;
      margin?: number;
    };
    tick?: {
      interval?: number;
    };
    scale: {
      min?: number;
      max?: number;
      stepSize?: 'auto' | number;
    };
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
    eventDetectType?: 'point' | 'grouped';
    clockwise?: boolean;
    radiusRange?: {
      inner?: number | string;
      outer?: number | string;
    };
    angleRange?: {
      start?: number;
      end?: number;
    };
    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      formatter?: (value) => string;
    };
  }
}
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Legend](./common-legend.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
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

![radial-bar-selectable-point](https://user-images.githubusercontent.com/43128697/107403655-b8f7d880-6b48-11eb-9ce5-2c64990f9d87.png)

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

### eventDetectType

Defines ways to select or detect the series via the mouse.

| Type | Details |
| --- | --- |
| `point` | A single series is detected when a mouse comes within the individual series' detectable area. Only a single series is selected with respect to the current position of the cursor. |
| `grouped` | All data that are equal with respect to the y-axis are detected. |

* default: `point`

![radial-bar-selectable-point](https://user-images.githubusercontent.com/43128697/107403655-b8f7d880-6b48-11eb-9ce5-2c64990f9d87.png)

Setting the `eventDetectType` to `'grouped'` will detect all series that are equal with respect to the y-axis.

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```

![radial-bar-eventDetectType.grouped](https://user-images.githubusercontent.com/43128697/107985089-b7c52080-700c-11eb-8a14-8bb01696ac38.png)

### clockwise

Determines the direction in which the series is painted. As default, the series is painted in the clockwise direction and when it is set to `false`, the series will be painted in the counterclockwise direction.

* default: `true`

```js
const options = {
  series: {
    clockwise: false
  }
};
```

![radia-bar-counter-clockwise](https://user-images.githubusercontent.com/43128697/107404237-6bc83680-6b49-11eb-8671-27135076b2d0.gif)


### radiusRange

The `radiusRange` uses `inner` and `outer` options to define the radii of inner and outer circles. The default value for `inner` is `0`. Using an `inner` value that is greater than 0 results in a donut shaped chart.

| Property | Details |
| --- | --- |
| `radiusRange.inner` | Inner radius |
| `radiusRange.outer` | Outer radius |

When a radius is provided as a string containing the percent sign (`%`), the radius will be calculated to be the provided proportion.

```js
const options = {
  series: {
    radiusRange: {
      inner: '20%',
      outer: '80%',
    }
  }
};
```

![radial-bar-radiusRange-percent](https://user-images.githubusercontent.com/43128697/107406157-78e62500-6b4b-11eb-9acb-be8c9e20e6b9.png)

When a numerical value is provided, the radius is calculated to be the absolute value of it.

```js
const options = {
  series: {
    radiusRange: {
      inner: 40,
      outer: 200,
    }
  }
};
```

![radial-bar-radiusRange-px](https://user-images.githubusercontent.com/43128697/107406353-b21e9500-6b4b-11eb-9e5e-eb7e15c2752e.png)

### angleRange

The `angleRange` uses `start` and `end` options to determine the range of the arc.

| Property | Details |
| --- | --- |
| `angleRange.start` | Arc's starting angle (default: `0`) |
| `angleRange.end` | Arc's ending angle (default: `360`) |

```js
const options = {
  series: {
    angleRange: {
      start: 45,
      end: 315,
    }
  }
};
```

![radial-bar-angleRanges](https://user-images.githubusercontent.com/43128697/107982838-15a33980-7008-11eb-9600-5138faf117f6.png)

### dataLabels

Data labels display information regarding the series on the chart.
The following are the options for `dataLabels`.

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      anchor?: 'center' | 'start' | 'end';
      formatter?: (value) => string;
    };
  };
};
```

| Name | Type | Details |
| --- | --- | --- |
| `visible` | boolean | Whether to make the data label visible |
| `formatter` | function | Takes the value of the data as its parameter and defines the format to be displayed |
| `anchor` | 'start' \| 'center' \| 'end' | Position of the data label (default: `'center'`)|


```js
// basic
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

```js
// setting the anchor to be start
const options = {
  series: {
    dataLabels: {
      visible: true,
      anchor: 'start'
    }
  }
};
```

| center anchor (basic) | Setting the anchor to be `start` |Setting the anchor to be `end` |
| --- | --- | --- |
| ![radial-bar.datalabels.anchor.center](https://user-images.githubusercontent.com/43128697/107407095-94056480-6b4c-11eb-83b6-2d63e935fa71.png) | ![radial-bar.datalabels.anchor.start](https://user-images.githubusercontent.com/43128697/107407117-9a93dc00-6b4c-11eb-99d5-40770d326bac.png) | ![radial-bar.datalabels.anchor.end](https://user-images.githubusercontent.com/43128697/107407103-9667be80-6b4c-11eb-9a72-18bed754ce49.png) |

## Series theme

The following is a list of themes that can be modified in the RadialBar chart. The value for the data label style includes the basic labels. Themes can be used to create a text bubble without a tail.

```ts
interface RadialBarChartSeriesTheme {
  colors?: string[];
  barWidth?: number | string;
  areaOpacity?: number;
  lineWidth?: number;
  strokeStyle?: string;
  hover?: {
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    color?: string;
    groupedSector?: {
      color?: string;
      opacity?: number;
    };
  };
  select?: {
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    color?: string;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
    groupedSector?: {
      color?: string;
      opacity?: number;
    };
  };
  dataLabels?: CommonDataLabelBoxTheme;
}

type CommonDataLabelBoxTheme = {
  useSeriesColor?: boolean;
  lineWidth?: number;
  textStrokeColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
  textBubble?: {
    visible?: boolean;
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
};
```

| Name | Type | Details |
| --- | --- | --- |
| `colors` | string[] | Colors for the series |
| `barWidth` | number | Width of the series |
| `areaOpacity` | number | Area opacity of the entire chart when all series have been activated |
| `lineWidth` | number | Series border width |
| `strokeStyle` | string | Series border color |
| `hover` | object | Style used when the cursor hovers over the series |
| `hover.groupedSector` | object | Style used for the box area that covers the chart with respect to the y-axis when `series.eventDetectType: 'grouped'` |
| `select` | object | Style used when `series.selectable: true` and a series is selected |
| `select.groupedSector` | object | Style used for the box area that is selected with respect to the y-axis when `series.eventDetectType: 'grouped'` |
| `dataLabels` | object | Style for the data labels |
| `dataLabels.useSeriesColor` | boolean | Whether to use the series colors for the data label texts |
| `dataLabels.lineWidth` | number | Text stroke width |
| `dataLabels.textStrokeColor` | string | Text stroke color |
| `dataLabels.shadowColor` | string | Text shadow color |
| `dataLabels.shadowBlur` | number | Text shadow blue |
| `dataLabels.fontSize` | number | Font size |
| `dataLabels.fontFamily` | string | Font name |
| `dataLabels.fontWeight` | string | Font weight |
| `dataLabels.color` | string | Text color; does not work when `useSeriesColor: true` |
| `dataLabels.textBubble` | object | Text bubble configurations |
| `dataLabels.textBubble.visible` | boolean | Whether to use the text bubble |
| `dataLabels.textBubble.paddingX` | number | Horizontal padding |
| `dataLabels.textBubble.paddingY`| number | Vertical padding |
| `dataLabels.textBubble.backgroundColor` | string | Text bubble background color |
| `dataLabels.textBubble.borderRadius` | number | Text bubble border radius |
| `dataLabels.textBubble.borderColor` | string | Text bubble border color |
| `dataLabels.textBubble.borderWidth` | number | Text bubble border width |
| `dataLabels.textBubble.shadowColor` | string | Text bubble shadow color |
| `dataLabels.textBubble.shadowOffsetX` | number | Text bubble shadow x offset |
| `dataLabels.textBubble.shadowOffsetY` | number | Text bubble shadow y offset |
| `dataLabels.textBubble.shadowBlur` | number | Text bubble shadow blur |

The theme is configured using the `theme` option, and the series theme is configured using the `theme.series`. The following example changes the color and the border style and applies shadow effect for a radialBar chart.

```js
const options = {
  theme: {
    series: {
      colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'],
      lineWidth: 2,
      strokeStyle: '#000000',
      hover: {
        strokeStyle: '#000000',
        lineWidth: 2,
        shadowColor: '#000000',
        shadowBlur: 6
      }
    }
  }
};
```

The code above results as shown below.

![radial-bar-series-theme](https://user-images.githubusercontent.com/43128697/107407956-aa5ff000-6b4d-11eb-8d98-fd2246642139.png)

The data label theme was applied to change the styles of text.

```js
const options = {
  series: {
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 12,
        fontWeight: 600,
        useSeriesColor: true,
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 6
      }
    }
  }
};
```

![radial-bar-series-datalabels-theme](https://user-images.githubusercontent.com/43128697/107408215-0165c500-6b4e-11eb-9a8a-5fa47756b770.png)
