# Bullet Chart

> API information regarding each chart is not addressed in this document. Refer to the [API Guide](./common-api.md).

## Creating the Chart

There are two different ways to create the Bullet chart. The Bullet chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { BulletChart } from '@toast-ui/chart';

const chart = new BulletChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.bulletChart({el, data, options});
```

## Basic Chart

### Data Type

The `series` value must be complete with `name`, `data`, `markers`, and `ranges`. The `name` is used to identify each series and its id must be unique.

```js
const data = {
  series: [
    {
      name: 'Budget',
      data: 25,
      markers: [28, 2, 15],
      ranges: [
        [-1, 10],
        [10, 20],
        [20, 30]
      ]
    },
    {
      name: 'Income',
      data: 11,
      markers: [20],
      ranges: [
        [0, 8],
        [8, 15]
      ]
    },
    {
      name: 'Expenses',
      data: 30,
      markers: [25],
      ranges: [
        [0, 10],
        [10, 19],
        [19, 28]
      ]
    },
    {
      name: 'Dept',
      data: 23,
      markers: [],
      ranges: [
        [19, 25],
        [13, 19],
        [0, 13]
      ]
    }
  ],
};
```

![image](https://user-images.githubusercontent.com/43128697/102740630-af958f80-4393-11eb-8685-ddd23d222fab.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.

```js
const data = {
  series: [
    {
      name: 'Budget',
      data: 25,
      markers: [28, 2, 15],
      ranges: [
        [-1, 10],
        [10, 20],
        [20, 30]
      ],
      visible: false,
    },
    {
      name: 'Income',
      data: 11,
      markers: [20],
      ranges: [
        [0, 8],
        [8, 15]
      ]
    },
    {
      name: 'Expenses',
      data: 30,
      markers: [25],
      ranges: [
        [0, 10],
        [10, 19],
        [19, 28]
      ]
    },
    {
      name: 'Dept',
      data: 23,
      markers: [],
      ranges: [
        [19, 25],
        [13, 19],
        [0, 13]
      ]
    }
  ],
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108008732-633d9780-7044-11eb-954f-2b1a28b5a978.png)


## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
    // ...
  },
  xAxis?: {
    // ...
  },
  yAxis?: {
    // ...
  },
  legend?: {
    // ...
  },
  exportMenu?: {
    // ...
  },
  tooltip?: {
    // ...
  },
  plot?: {
    // ...
  },
  responsive?: {
    // ...
  },
  theme?: {
    // More explanations in the `theme` chapter.
  },
  series?: {
    vertical?: boolean;
    selectable?: boolean;
    eventDetectType?: 'point' | 'grouped';
    dataLabels?: {
      visible?: boolean;
      anchor?: 'center' | 'start' | 'end' | 'auto';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    };
  }
};
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Axes](./common-axes.md),
> [Legend](./common-legend.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
> [Plot](./common-plot.md),
> [`responsive` Options](./common-responsive-options.md)
> )

### vertical

The Bullet chart is drawn horizontally by default. Setting the `vertical` option to be `true` allows users to draw a vertical Bullet chart.

```js
const options = {
  series: {
    vertical: true
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102740899-3480a900-4394-11eb-8156-2ad11a018843.png)

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

![image](https://user-images.githubusercontent.com/43128697/102741068-b7a1ff00-4394-11eb-9824-f2f404076e1a.png)

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

### eventDetectType

Defines ways to detect or select data through the mouse.

| Type | Details |
| --- | --- |
| `point` | A single series is detected when a mouse comes within the individual series' detectable area. Only a single series is selected with respect to the current position of the cursor. |
| `grouped` | All data that are equal with respect to the y-axis (x-axis if `vertical: true`) are detected. |

* default: `point`

![eventDetectType.point](https://user-images.githubusercontent.com/43128697/103997120-085f8780-51de-11eb-9bfe-78af1e667a34.png)

If the `eventDetectType` is set to `'grouped'`, all data that are equal with respect to y-axis (x-axis if `vertical: true`) are detected.

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```

![eventDetectType.grouped](https://user-images.githubusercontent.com/43128697/103996962-dcdc9d00-51dd-11eb-8ee7-c3076cd6ec42.png)

### dataLabels
Data labels display information regarding the series on the chart.
The following are the options for `dataLabels`.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      anchor: 'start' | 'center' | 'end' | 'auto';
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
| `anchor` | 'start' \| 'center' \| 'end' \| 'auto' | Position of the data label (default: `'center'`)|

```js
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476560-61a07300-4dfa-11eb-934c-35b65bf0a761.png)

## Series Theme

The following is a list of themes that can be modified in the Bullet chart. The styles used to style the data label can not only style the basic label that displays the data value, but as well as the label that displays the marker data. Themes can be used to create a text bubble with a tail.

```ts
interface BulletChartSeriesTheme {
  areaOpacity?: number;
  colors?: string[];
  barWidth?: number | string;
  barWidthRatios?: {
    rangeRatio?: number;
    bulletRatio?: number;
    markerRatio?: number;
  };
  markerLineWidth?: number;
  rangeColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
  };
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  };
  dataLabels?: CommonDataLabelBubbleTheme & {
    marker?: CommonDataLabelBubbleTheme;
  };
}

type CommonDataLabelBubbleTheme = {
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
    arrow?: {
      visible?: boolean;
      width?: number;
      height?: number;
      direction?: 'top' | 'right' | 'bottom' | 'left';
    };
  };
};
```


| Name | Type | Details |
| --- | --- | --- |
| `colors` | string[] | Series colors |
| `areaOpacity` | number | Area opacity of the entire chart when all series have been activated |
| `barWidth` | number \| string | Series box width |
| `barWidthRatios` | object |  Ratio among range, Bullet box width, and marker length  |
| `barWidthRatios.rangeRatio` | number | Range width ratio (default: 1) |
| `barWidthRatios.bulletRatio` | number | Bullet box width ratio (default: 0.5) |
| `barWidthRatios.markerRatio` | number | Marker line length ratio (default: 0.5) |
| `markerLineWidth` | number | Marker line width |
| `rangeColor` | string[] | Range colors |
| `borderColor` | string | Bullet box border color |
| `borderWidth` | number | Bullet box border width |
| `hover` | object | Styles for when the cursor hovers over the data |
| `hover.groupRect` | object | Styles for the horizontal (vertical) box overlay displayed when `series.eventDetectType: 'grouped'` |
| `select` | object | Styles for when `series.selectable: true` and a series is selected |
| `select.areaOpacity` | number | Opacity of the selected series area |
| `select.groupOpacity` | number | Styles for the horizontal (vertical) box area selected when `series.eventDetectType: 'grouped'` |
| `select.restSeries` | object | Styles for the series that have not been selected |
| `select.restSeries` | object | Style for series that have not been selected |
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
| `dataLabels.textBubble.arrow` | object | Text bubble arrow configurations |
| `dataLabels.textBubble.arrow.visible` | boolean | Whether to use the text bubble arrows |
| `dataLabels.textBubble.arrow.width` | number | Arrow base width |
| `dataLabels.textBubble.arrow.height` | number | Arrow height |
| `dataLabels.textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | Arrow direction |
| `dataLabels.marker` | object | Marker label style; all options available for `dataLabels` are also available for this option |

The theme is configured using the `theme` option, and the series theme is configured using the `theme.series`. The following example changes the color, width, on-hover style of a Bullet series.

```js
const options = {
  theme: {
    series: {
      colors: ['#540D6E', '#EE4266', '#FFD23F', '#3BCEAC'],
      barWidth: '50%',
      barWidthRatios: {
        rangeRatio: 1,
        bulletRatio: 0.4,
        markerRatio: 0.4,
      },
      markerLineWidth: 3,
      rangeColors: ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)'],
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 1)',
      hover: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 1)',
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 6,
      }
    }
  }
};
```

The code above results as shown below.


![image](https://user-images.githubusercontent.com/43128697/102742822-3ef17180-4399-11eb-9f8f-5c43500b8c2f.png)

The data label theme was applied to add text bubbles and to change the font styles.

```js
const options = {
  series: {
    dataLabels: {
      visible: true
    }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'fantasy',
        fontSize: 13,
        fontWeight: 500,
        useSeriesColor: true,
        textBubble: {
          visible: true,
          backgroundColor: '#eeeeee',
          borderWidth: 1,
          borderColor: '#333333',
          borderRadius: 5,
          arrow: { visible: true, width: 4, height: 4 }
        },
        marker: {
          fontFamily: 'fantasy',
          fontSize: 13,
          fontWeight: 600,
          useSeriesColor: false,
          color: '#ffffff',
          textStrokeColor: '#000000',
          shadowColor: '#000000',
          shadowBlur: 6,
          textBubble: { visible: false }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476561-62d1a000-4dfa-11eb-8fce-b7740715961f.png)
