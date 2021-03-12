# Pie Chart

> API information regarding each chart is not addressed in this document. Refer to the [API Guide](./common-api.md).

## Creating the Chart

There are two different ways to create the Pie chart. The Pie chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { PieChart } from '@toast-ui/chart';

const chart = new PieChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.pieChart({el, data, options});
```

## Basic Chart

### Data Type

The data is entered as a `series` and must be a pair of `name` and `data`.

```js
const data = {
  categories: ['Browser'],
  series: [
    {
      name: 'Chrome',
      data: 46.02,
    },
    {
      name: 'IE',
      data: 20.47,
    },
    {
      name: 'Firefox',
      data: 17.71,
    },
    {
      name: 'Safari',
      data: 5.45,
    },
    {
      name: 'Opera',
      data: 3.1,
    },
    {
      name: 'Etc',
      data: 7.25,
    }
  ]
}
```

![image](https://user-images.githubusercontent.com/43128697/102743434-cd1a2780-439a-11eb-8bda-0a2a8d142ad4.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.

```js
const data = {
  categories: ['Browser'],
  series: [
    {
      name: 'Chrome',
      data: 46.02,
      visible: false
    },
    {
      name: 'IE',
      data: 20.47,
    },
    {
      name: 'Firefox',
      data: 17.71,
    },
    {
      name: 'Safari',
      data: 5.45,
    },
    {
      name: 'Opera',
      data: 3.1,
    },
    {
      name: 'Etc',
      data: 7.25,
    }
  ]
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108011697-fda0d980-704a-11eb-996e-b0b9670745b0.png)


## Options

`options` should be used as an object.

```ts
type options = {
  chart?: {
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
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      pieSeriesName?: {
        visible: boolean;
        anchor?: 'center' | 'outer';
      };
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

![image](https://user-images.githubusercontent.com/43128697/102746471-b4614000-43a1-11eb-925c-7622c72c611a.png)

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

![image](https://user-images.githubusercontent.com/43128697/102980458-ef52a780-454a-11eb-9998-22a92e2ed45e.gif)

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
      inner: '40%',
      outer: '100%',
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102746399-8976ec00-43a1-11eb-88f4-c86a5240e493.png)

When a numerical value is provided, the radius is calculated to be the absolute value of it.

```js
const options = {
  series: {
    radiusRange: {
      inner: 80,
      outer: 200,
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102746372-7e23c080-43a1-11eb-94a3-c483f1d03117.png)

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
      start: -90,
      end: 90,
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102748114-ec1db700-43a4-11eb-8f27-e0c881d55e00.png)

A various combination of `clockwise`, `radiusRange`, and `angleRange` can be used to create numerous different shapes of pie charts.

```js
const options = {
  series: {
    clockwise: false,
    radiusRange: {
      inner: '70%',
      outer: '90%',
    },
    angleRange: {
      start: 135,
      end: 225,
    },
  },
};
```

![image](https://user-images.githubusercontent.com/43128697/102748528-af9e8b00-43a5-11eb-865d-1ba8ce15256a.png)

### dataLabels
Data labels display information regarding the series on the chart.
The following are the options for `dataLabels`.

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      anchor?: 'center' | 'outer';
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      pieSeriesName?: {
        visible: boolean;
        anchor?: 'center' | 'outer';
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
| `anchor` | 'start' \| 'center' \| 'end' \| 'auto' | Position of the data label; `'center'` places the label inside of the circle and the `'outer'` places the label outside of the circle.<br> (default: `'center'`)|
| `pieSeriesName` | object | Configurations for displaying the series name label |
| `pieSeriesName.visible` | boolean | Whether to make the series name label visible |
| `pieSeriesName.anchor` | 'center' \| 'outer' | Positional configurations for series name label;<br> `'center'` places the label inside of the circle and the `'outer'` places the label outside of the circle.<br> (default: `'center'`) |


```js
// Basic
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

```js
// setting the anchor to be outer
const options = {
  series: {
    dataLabels: {
      visible: true,
      anchor: 'outer'
    }
  }
};
```

| Basic | Setting the anchor to be `outer` |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/103474427-13ce3f80-4de7-11eb-97f6-58ab2cd29001.png) | ![image](https://user-images.githubusercontent.com/43128697/103474431-15980300-4de7-11eb-9664-e96e7e763422.png) |


```js
// basic - series name label visible
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: { visible: true }
    }
  }
};
```

```js
// setting the pieSeriesName.anchor to be outer
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: {
        visible: true,
        anchor: 'outer'
      }
    }
  }
};
```

| Basic - Series name label visible | Setting the pieSeriesName.anchor to be `outer` |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/103474482-b38bcd80-4de7-11eb-99ac-54842fe29b0d.png) | ![image](https://user-images.githubusercontent.com/43128697/103474483-b5ee2780-4de7-11eb-812a-045f78f71e8f.png) |

## Series Theme

The following is a list of themes that can be modified in the Pie chart. The value for the data label style includes the basic labels and can be used to configure the callout line styles. Themes can be used to create a text bubble without a tail.

```ts
interface PieChartSeriesTheme {
  colors?: string[];
  areaOpacity?: number;
  lineWidth?: number;
  strokeStyle?: string;
  hover?: {
    color?: string;
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  select?: {
    color?: string;
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  };
  dataLabels?: CommonDataLabelBoxTheme & {
    pieSeriesName?: CommonDataLabelBoxTheme;
    callout?: {
      useSeriesColor?: boolean;
      lineWidth?: number;
      lineColor?: string;
    };
  };
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
| `areaOpacity` | number | Area opacity of the entire chart when all series have been activated |
| `lineWidth` | number | Series border width |
| `strokeStyle` | string | Series border color |
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
| `dataLabels.pieSeriesName` | object | Styles used for the label that displays the series name; all style options available to `dataLabels` are also available with this option |
| `dataLabels.callout` | object | Styles used for the callout lines that connect the circle and the label that is outside of the circle |
| `dataLabels.callout.useSeriesColor` | boolean | Whether to use the series colors for the data label texts |
| `dataLabels.callout.lineWidth` | number | callout line width |
| `dataLabels.callout.lineColor` | string | callout line color; does not work when `useSeriesColor: true` |

The theme is configured using the `theme` option, and the series theme is configured using the `theme.series`. The following example changes the color and the border style for a pie chart.

```js
const options = {
  theme: {
    series: {
      colors: ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'],
      lineWidth: 2,
      strokeStyle: '#000000',
    }
  }
}
```

The code above results as shown below.

![image](https://user-images.githubusercontent.com/43128697/102745724-fab59f80-439f-11eb-892c-1ece9aa9845f.png)

The data label theme was applied to change the styles of text, callout line, and series name label.

```js
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: { visible: true, anchor: 'outer' }
    }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        useSeriesColor: true,
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 4,
        callout: {
          lineWidth: 3,
          lineColor: '#f44336',
          useSeriesColor: false
        },
        pieSeriesName: {
          useSeriesColor: false,
          color: '#f44336',
          fontFamily: 'fantasy',
          fontSize: 13,
          textBubble: {
            visible: true,
            paddingX: 1,
            paddingY: 1,
            backgroundColor: 'rgba(158, 158, 158, 0.3)',
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

![image](https://user-images.githubusercontent.com/43128697/102973846-db09ad00-4540-11eb-9f9e-36186740d3b4.png)
