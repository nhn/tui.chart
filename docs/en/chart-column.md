# Column Chart

> API information regarding each chart is not addressed in this document. Refer to the [API Guide](./common-api.md).

## Creating the Chart

There are two different ways to create the Column chart. The Column chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { ColumnChart } from '@toast-ui/chart';

const chart = new ColumnChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.columnChart({el, data, options});
```

## Basic Chart

### Data Type

`categories` values are shown on the y-axis, and the `series` value must be completed with the `name` and the `data`. The `name` is used to identify each series and its id must be unique.

```js
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000]
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000, 5000]
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000, 7000]
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000, 3000]
    }
  ]
}
```

![image](https://user-images.githubusercontent.com/43128697/102730231-54ee3a80-4377-11eb-8204-c0581b5d11e0.png)

## range Chart

### Data Type

The difference between the basic chart and the range chart lies in the type of the series data. The data is entered as an `array`, and the numerical values for the start and the end of the range should be entered in order.

```js
const data = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Seoul',
      data: [
        [-8.3, 0.3],
        [-5.8, 3.1],
        [-0.6, 9.1],
        [5.8, 16.9],
        [11.5, 22.6],
        [16.6, 26.6],
        [21.2, 28.8],
        [21.8, 30.0],
        [15.8, 25.6],
        [8.3, 19.6],
        [1.4, 11.1],
        [-5.2, 3.2],
      ],
    },
    {
      name: 'Busan',
      data: [
        [0, 10],
        [3.5, 13.1],
        [5.6, 13.1],
        [10.8, 16.9],
        [11.5, 18.6],
        [13.6, 20.6],
        [15.2, 20.8],
        [21.8, 26.0],
        [17.8, 23.6],
        [11.3, 16.6],
        [4.4, 11.1],
        [3.2, 11.2],
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/43128697/102730263-77805380-4377-11eb-94c7-1505a12693f5.png)

## Stack Group Chart
The `stack` option allows multiple series to be displayed on a single stacked chart. Adding the `stackGroup` attribute allows multiple series to be stacked together according to the stackGroup.

```js
const data = {
  categories: [
    '0 ~ 9',
    '10 ~ 19',
    '20 ~ 29',
    '30 ~ 39',
    '40 ~ 49',
    '50 ~ 59',
    '60 ~ 69',
    '70 ~ 79',
    '80 ~ 89',
    '90 ~ 99',
    '100 ~',
  ],
  series: [
    {
      name: 'Male - Seoul',
      data: [4007, 5067, 7221, 8358, 8500, 7730, 4962, 2670, 6700, 776, 131],
      stackGroup: 'Male',
    },
    {
      name: 'Female - Seoul',
      data: [3805, 4728, 7244, 8291, 8530, 8126, 5483, 3161, 1274, 2217, 377],
      stackGroup: 'Female',
    },
    {
      name: 'Male - Incheon',
      data: [1392, 1671, 2092, 2339, 2611, 2511, 1277, 6145, 1713, 1974, 194],
      stackGroup: 'Male',
    },
    {
      name: 'Female - Incheon',
      data: [1320, 1558, 1927, 2212, 2556, 2433, 1304, 8076, 3800, 6057, 523],
      stackGroup: 'Female',
    },
  ],
};

const options = {
  series: {
    stack: true
  }
};
```

![group-stack](https://user-images.githubusercontent.com/43128697/102730289-92eb5e80-4377-11eb-926e-8f46725601fc.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.
The basic chart, range, and stack group chart use the same way.

```js
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000],
      visible: false
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000, 5000]
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000, 7000]
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000, 3000]
    }
  ]
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108008989-f545a000-7044-11eb-837e-13e832db396e.png)

## colorByCategories

Each `series` can have `colorByCategories` option. The `colorByCategories` option determines whether to paint the column color of the chart differently based on the categories. The default value is `false`.

```js
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000],
      colorByCategories: true
    }
  ]
}
```
![image](https://user-images.githubusercontent.com/30035674/133178923-2c59c916-fcf8-4285-95b3-cf3c64aec59a.png)

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
    stack?: boolean | {
      type: 'normal' | 'percent';
      connector?: boolean;
    };
    selectable?: boolean;
    eventDetectType?: 'point' | 'grouped';
    diverging?: boolean;
    dataLabels?: {
      visible?: boolean;
      anchor?: 'center' | 'start' | 'end' | 'auto';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      stackTotal?: {
        visible?: boolean;
        formatter?: (value) => string;
      };
    };
  }
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
> [`responsive` Options](./common-responsive-options.md)
> )

### stack

The `stack` option allows multiple series to form a stacked chart. The stack chart includes `'normal'` type and the `'percent'` type. The `stack.connector` option can be used to display the connectors (the line segments that connect the series according to the categories).

### normal Type

Setting `series.stack` to `true` is identical to setting `stack.type` to `'normal'`.

```js
const options = {
  series: {
    stack: true
  }
}

// or

const options = {
  series: {
    stack: {
      type: 'normal'
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102730331-b7dfd180-4377-11eb-8462-d617dc7e57cf.png)

Setting the `connector` to `true` displays the connectors.

```js
const options = {
  series: {
    stack: {
      type: 'normal',
      connector: true
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102730349-cf1ebf00-4377-11eb-9fdf-8625fa33782c.png)

### percent Type

Setting `stack.type` to `'percent'` calculates the percentage of the sum for each and uses it to build the stack chart.

```js
const options = {
  series: {
    stack: {
      type: 'percent'
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102730377-e3fb5280-4377-11eb-8cf0-d04fb23b3afa.png)

Setting the `connector` to `true` displays the connectors.

```js
const options = {
  series: {
    stack: {
      type: 'percent',
      connector: true
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102730431-1c029580-4378-11eb-8f2f-fda4d7e2721c.png)

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

![image](https://user-images.githubusercontent.com/43128697/102730580-7e5b9600-4378-11eb-82fc-dbde1ce743dd.png)

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

### eventDetectType

Defines ways to select or detect the series via the mouse.

| Type | Details |
| --- | --- |
| `point` | A single series is detected when a mouse comes within the individual series' detectable area. Only a single series is selected with respect to the current position of the cursor. |
| `grouped` | All data that are equal with respect to the y-axis are detected. |

* default: `point`

![eventDetectType.point](https://user-images.githubusercontent.com/43128697/102730663-c24e9b00-4378-11eb-9d51-9ba501b1520f.png)

Setting the `eventDetectType` to `'grouped'` will detect all series that are equal with respect to the x-axis.

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```

![eventDetectType.grouped](https://user-images.githubusercontent.com/43128697/102730667-c5498b80-4378-11eb-8718-b11b41b632f2.png)

### diverging

The `diverging` option, when used, allows users to create a diverging bar chart that diverges from the center like the population distribution chart. The diverging chart uses the first element as well as the second element from the `data.series`.

* default: `false`

```js
const data = {
    categories: [
    '100 ~',
    '90 ~ 99',
    '80 ~ 89',
    '70 ~ 79',
    '60 ~ 69',
    '50 ~ 59',
    '40 ~ 49',
    '30 ~ 39',
    '20 ~ 29',
    '10 ~ 19',
    '0 ~ 9',
  ],
  series: [
    {
      name: 'Male',
      data: [383, 3869, 39590, 136673, 248265, 419886, 451052, 391113, 352632, 296612, 236243],
    },
    {
      name: 'Female',
      data: [1255, 12846, 83976, 180790, 263033, 412847, 435981, 374321, 317092, 272438, 223251],
    },
  ],
};

const options = {
  series: {
    diverging: true
  }
};
```
![diverging](https://user-images.githubusercontent.com/43128697/102730699-ea3dfe80-4378-11eb-8f35-2636e7a10a13.png)

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
      stackTotal?: {
        visible?: boolean;
        formatter?: (value) => string;
      };
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
| `anchor` | 'start' \| 'center' \| 'end' \| 'auto' | Position of the data label (default: `'auto'`) |
| `stackTotal` | object | Defines the options related to displaying the total sum of the stack bar chart |
| `stackTotal.visible` | boolean | Whether to display the total sum label. If the chart is a stack chart, the default value is `true`. |
| `stackTotal.formatter` | function | Takes the value of data sum as its parameter and defines the format to be displayed |

```js
// basic
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476415-b3e09480-4df8-11eb-9fa1-56125f3fd0a7.png)

```js
// Stack column chart
const options = {
  series: {
    stack: true,
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478831-ba790700-4e0c-11eb-82bb-14d593d60543.png)

## Series Theme

The following is a list of themes that can be modified in the Column chart. The value for the data label style includes the basic labels, and when used with stack bar chart, it can be used to style the sum label that is displayed. Themes can be used to create a text bubble with a tail.

```ts
interface BoxChartSeriesTheme {
  barWidth?: number | string;
  areaOpacity?: number;
  colors?: string[];
  hover?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    groupedRect?: {
      color?: string;
      opacity?: number;
    };
  };
  select?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    areaOpacity?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    groupedRect?: {
      color?: string;
      opacity?: number;
    };
    restSeries?: {
      areaOpacity?: number;
    };
  };
  connector?: {
    color?: string;
    lineWidth?: number;
    dashSegments?: number[];
  };
  dataLabels?: CommonDataLabelBubbleTheme & {
     stackTotal?: CommonDataLabelBubbleTheme;
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
| `barWidth` | number \| string | Width of the series box |
| `areaOpacity` | number | Opacity of the entire area when all series are selected |
| `colors` | string[] | Colors for the series |
| `hover` | object | Style used when the cursor hovers over the series |
| `hover.groupRect` | object | Style used for the box area that covers the chart with respect to the x-axis when `series.eventDetectType: 'grouped'` |
| `select` | object | Style used when the series is selected and `series.selectable: true` |
| `select.areaOpacity` | number | Opacity of the selected series |
| `select.groupRect` | object | Style used for the box area that is selected with respect to the x-axis when `series.eventDetectType: 'grouped'` |
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
| `dataLabels.stackTotal` | object | Label styles for stack charts; all style options available to `dataLabels` are also available with this option |

The theme is configured using the `theme` option, and the series theme is configured using the `theme.series`. The following example changes the color, width, and the on-hover style for a column series.

```js
const options = {
  theme: {
    series: {
      barWidth: 5,
      colors: ['#EDAE49', '#D1495B', '#00798C', '#30638E'],
      hover: {
        color: '#00ff00',
        borderColor: '#73C8E7',
        borderWidth: 3,
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowBlur: 6,
      },
    }
  }
};
```

The code above results as shown below.

![image](https://user-images.githubusercontent.com/43128697/102731093-47867f80-437a-11eb-8103-8a3060dea9a7.png)

The code below applies a theme to the data label to use text bubbles and to change the text styles.

```js
const options = {
  series: {
    stack: true,
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 4,
        stackTotal: {
          fontFamily: 'monaco',
          fontWeight: 14,
          color: '#ffffff',
          textBubble: {
            visible: true,
            paddingY: 6,
            borderWidth: 3,
            borderColor: '#00bcd4',
            borderRadius: 7,
            backgroundColor: '#041367',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)'
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103476423-bf33c000-4df8-11eb-8e9c-2d5b718c3f3e.png)
