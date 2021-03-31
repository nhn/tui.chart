# Gauge Chart

> API information regarding each chart is not addressed in this document. Refer to the [API Guide](./common-api.md).

## Creating the Chart

There are two different ways to create the Gauge chart. The Gauge chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { GaugeChart } from '@toast-ui/chart';

const chart = new GaugeChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.gaugeChart({el, data, options});
```

## Basic Chart

### Data Type

 the `series` value must be completed with the `name` and the `data`. The `name` is used to identify each series and its id must be unique.

```js
const data = {
  series: [
    {
      name: 'Speed',
      data: [80],
    },
  ],
};
```

![gauge-basic](https://user-images.githubusercontent.com/43128697/110775762-a33e1600-82a2-11eb-82cc-594bf41e9638.png)

### Category Data Type

If you enter `categories`, the label displayed on the Circular Axis will display the category value.

```js
const data = {
  categories: ['Apple', 'Watermelon', 'Blueberry', 'Grape', 'Orange'],
  series: [
    {
      name: 'Fruit',
      data: ['Orange'],
    },
  ],
};
```

![gauge-basic-with-category](https://user-images.githubusercontent.com/43128697/110789379-26676800-82b3-11eb-966a-d0cb293d87bc.png)

## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
    //...
  }
  circularAxis?: {
    title?: string | {
      text: string;
      offsetX?: number;
      offsetY?: number;
    };
    label?: {
      interval?: number;
      formatter?: (value: string, axisLabelInfo: { axisName: AxisType; labels: string[]; index: number }) => string;
      margin?: number;
    };
    tick?: {
      interval?: number;
    };
    scale?: {
      min?: number;
      max?: number;
      stepSize?: 'auto' | number;
    };
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
    chart?: ChartTheme;
    title?: FontTheme;
    tooltip?: TooltipTheme;
    exportMenu?: ExportMenuTheme;
    circularAxis?: {
      label?: {
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
          textAlign?: CanvasTextAlign;
          borderColor?: string;
          borderWidth?: number;
          shadowColor?: string;
          shadowOffsetX?: number;
          shadowOffsetY?: number;
          shadowBlur?: number;
        };
      };
      lineWidth?: number;
      strokeStyle?: string;
      dotColor?: string;
      title?: {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string | number;
        color?: string;
      };
      tick?: {
        lineWidth?: number;
        strokeStyle?: string;
      };
    };
    plot?: {
      bands?: { barWidth?: number };
    };
    series?: {
      // More explanations in the `Series theme` chapter.
    };
  }
  plot?: {
    width?: number | undefined;
    height?: number | undefined;
    bands?: {
      color: string;
      range: number[] | string[];
      id?: string;
    }[];
  };
  series?: {
    solid?: boolean | { clockHand?: boolean };
    selectable?: boolean;
    clockwise?: boolean;
    angleRange?: {
      start?: number;
      end?: number;
    };
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    };
  }
}
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
> [`responsive` Options](./common-responsive-options.md),
> [Plot](./common-plot.md)
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

![gauge-selectable](https://user-images.githubusercontent.com/43128697/110799626-b9f26600-82be-11eb-981f-239cfba4765c.png)

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

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
![gauge-counter-clockwise](https://user-images.githubusercontent.com/43128697/110800382-764c2c00-82bf-11eb-908d-e9d73da946e5.png)

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
      start: 225,
      end: 135,
    }
  }
};
```

![gauge-angleRanges](https://user-images.githubusercontent.com/43128697/110799920-0473e280-82bf-11eb-8533-6f4620f0d59b.png)

### solid

The `solid` option allows the data to be represented as a radial bar. It can be used when the chart data is 1 `series` and 1 `data`.

* default: `false`

```js
const options = {
  series: {
    solid: true
  }
};
```

![gauge-solid-with-basic](https://user-images.githubusercontent.com/43128697/110801463-9fb98780-82c0-11eb-9b11-9ef57ded4679.png)

When rendering a series in `solid` type, you can set whether to display a clock hand indicating a value.

* default: `false`

```js
series: {
  solid: { clockHand: true },
}
```

![gauge-solid-with-clockhand](https://user-images.githubusercontent.com/43128697/110800901-07bb9e00-82c0-11eb-8ad4-4c7b1a250c1b.png)

The following image shows the `series.dataLabels` option and the `theme` option set.

![gauge-solid-without-clockhand-on-theme](https://user-images.githubusercontent.com/43128697/110801678-d394ad00-82c0-11eb-895c-ea0ae485d77f.png)


### dataLabels

Data labels display information regarding the series on the chart.
The following are the options for `dataLabels`.

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    };
  };
};
```

| Name | Type | Details |
| --- | --- | --- |
| `visible` | boolean | Whether to make the data label visible |
| `offsetX` | number | X offset of the data label position |
| `offsetY` | number | Y offset of the data label position |
| `formatter` | function | Takes the value of the data as its parameter and defines the format to be displayed |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![gauge-dataLabels](https://user-images.githubusercontent.com/43128697/110802223-561d6c80-82c1-11eb-8dc2-a412c7e9c8a1.png)

## Series theme

The following is a list of themes that can be modified in the Gauge chart. The value for the data label style includes the basic labels. Themes can be used to create a text bubble without a tail.

```ts
interface GaugeChartSeriesTheme {
  colors?: string[];
  areaOpacity?: number;
  solid?: SolidTheme;
  clockHand?: ClockHandTheme;
  pin?: PinTheme;
  hover?: {
    clockHand?: ClockHandTheme;
    pin?: PinTheme;
    solid?: Omit<SolidTheme, 'backgroundSector'>;
  };
  select?: {
    clockHand?: ClockHandTheme;
    pin?: PinTheme;
    solid?: Omit<SolidTheme, 'backgroundSector'>;
    areaOpacity?: number;
    restSeries?: {
      areaOpacity?: number;
    };
  };
  dataLabels?: CommonDataLabelBoxTheme;
}

type ClockHandTheme = {
  color?: string;
  size?: string | number | number[] | string[];
  baseLine?: number;
};

type PinTheme = {
  radius?: number;
  color?: string;
  borderWidth?: number;
  borderColor?: string;
};

type SolidTheme = {
  barWidth?: number | string;
  lineWidth?: number;
  strokeStyle?: string;
  backgroundSector?: { color?: string };
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  color?: string;
};

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
| `areaOpacity` | number | Area opacity of the entire chart when all series have been activated |
| `solid` | object | Solid Sector Style |
| `solid.barWidth` | object | Width of the series' sector |
| `solid.lineWidth` | number \| string | Series' sector border width |
| `solid.strokeStyle` | string | Series' sector border color |
| `solid.backgroundSector` | object | Style of the background sector |
| `solid.backgroundSector.color` | string | Background color of the series' sector |
| `solid.shadowColor` | string | Series' sector shadow color |
| `solid.shadowBlur` | number | Series' sector shadow Blur |
| `solid.shadowOffsetX` | number | Series' sector shadow x offset |
| `solid.shadowOffsetY` | number | Series' sector shadow y offset |
| `solid.color` | string | Series' sector color |
| `clockHand` | object | Clock-hand Style |
| `clockHand.color` | string | Color of the clock-hand |
| `clockHand.size` | number | Length of the clock-hand  |
| `clockHand.baseLine` | number | Base line of the clock-hand  |
| `pin` | object | Pin Style |
| `pin.radius` | number | Radius of pin |
| `pin.color` | string | Color of pin |
| `pin.borderWidth` | number | Border width of pin |
| `pin.borderColor` | string | Border color of pin |
| `hover` | object | Style used when the cursor hovers over the series |
| `select` | object | Style used when `series.selectable: true` and a series is selected |
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

The theme is configured using the `theme` option, and the series theme is configured using the `theme.series`. The following example changes the color and the border style and applies solid for a gauge chart.

```js
const options = {
  series: {
    solid: true,
  },
  theme: {
    series: {
      colors: [color],
      solid: {
        barWidth: 10,
        lineWidth: 5,
        strokeStyle: '#000',
        backgroundSector: { color: 'rgba(189, 67, 67, 0.1)' },
        hover: {
          color: '#ff0000',
          lineWidth: 5,
          strokeStyle: '#000',
        },
        select: {
          lineWidth: 3,
          strokeStyle: '#000',
        },
      },
    },
  },
};
```

The code above results as shown below.

![gauge-series-theme](https://user-images.githubusercontent.com/43128697/110804757-ce852d00-82c3-11eb-8642-a5c15ab7979f.png)

The code below is an option to change the chart style by applying the theme that can be used in the Gauge chart.

```js
const options = {
  chart: { width: 700, height: 400 },
  circularAxis: { title: 'km/h', scale: { min: 0, max: 100 } },
  series: {
    angleRange: {
      start: 270,
      end: 90,
    },
    dataLabels: { visible: true, offsetY: -200, formatter: (value) => `${value} %` },
  },
  plot: {
    bands: [
      { range: [0, 20], color: '#e4a0c2' },
      { range: [20, 50], color: '#dc4d94' },
      { range: [50, 100], color: '#a90757' },
    ],
  },
  theme: {
    chart: { fontFamily: 'Impact' },
    circularAxis: {
      title: { fontWeight: 500, fontSize: 30, color: baseColor },
      label: { color: baseColor, fontSize: 15 },
      tick: { strokeStyle: baseColor },
      strokeStyle: baseColor,
    },
    series: {
      clockHand: {
        color: baseColor,
        baseLine: 10,
      },
      pin: {
        radius: 10,
        color: baseColor,
        borderWidth: 5,
        borderColor: 'rgba(101, 4, 52, 0.3)',
      },
      dataLabels: {
        fontSize: 30,
        color: '#fff',
        textBubble: {
          visible: true,
          backgroundColor: baseColor,
          paddingX: 5,
          paddingY: 5,
        },
      },
    },
    plot: { bands: { barWidth: 50 } },
  },
};
```

![gauge-theme](https://user-images.githubusercontent.com/43128697/110803438-8a455d00-82c2-11eb-8771-8dba322cb193.png)
