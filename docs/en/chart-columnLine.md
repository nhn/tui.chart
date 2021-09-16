# ColumnLine Chart

> API information regarding each chart is not addressed in this document. Refer to the [API Guide](./common-api.md).

## Creating the Chart

There are two different ways to create the ColumnLine chart. The ColumnLine chart can be created through the constructor function or the static function. The two methods both result in returning an instance of the chart. The HTML element in which the chart is drawn `el`, data `data`, and the options object `options` are taken as parameters. If the element in which the chart is drawn contains elements other than the chart itself, it may unintentionally affect the chart. Therefore, it is recommended that you use an empty HTML element.

```js
import { ColumnLineChart } from '@toast-ui/chart';

const chart = new ColumnLineChart({el, data, options});

// or

import Chart from '@toast-ui/chart';

const chart = Chart.columnLineChart({el, data, options});
```

## Basic Chart

### Data Type

The data is entered as a `series`. Each chart series is provided to the `column` and `line`, and `name` and `data` pair are entered. The data is entered as an array of representative values.

```js
const data = {
  categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  series: {
    column: [
      {
        name: 'Seoul',
        data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9],
      },
      {
        name: 'NewYork',
        data: [9.9, 16.0, 21.2, 24.2, 23.2, 19.4, 13.3],
      },
      {
        name: 'Sydney',
        data: [18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6],
      },
      {
        name: 'Moscow',
        data: [4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2],
      },
    ],
    line: [
      {
        name: 'Average',
        data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3],
      },
    ],
  },
};
```

![image](https://user-images.githubusercontent.com/43128697/102773432-8f35f700-43cc-11eb-82fe-2eef25c5dada.png)

## visible

Each `series` can have `visible` option. The `visible` option determines whether the series is displayed when the chart is first drawn. The default is `true`.

```js
const data = {
  categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  series: {
    column: [
      {
        name: 'Seoul',
        data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9],
        visible: false,
      },
      {
        name: 'NewYork',
        data: [9.9, 16.0, 21.2, 24.2, 23.2, 19.4, 13.3],
      },
      {
        name: 'Sydney',
        data: [18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6],
      },
      {
        name: 'Moscow',
        data: [4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2],
      },
    ],
    line: [
      {
        name: 'Average',
        data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3],
        visible: false,
      },
    ],
  },
}
```

If you create a chart by applying the above option, you can see that the checkbox is unchecked.

![image](https://user-images.githubusercontent.com/35371660/108009092-3fc71c80-7045-11eb-901e-03d20fdee3dc.png)


## colorByCategories

Bar-like `series` can have `colorByCategories` option. The `colorByCategories` option determines whether to paint the column color of the chart differently based on the categories. The default value is `false`.

```js
const data = {
  categories: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  series: {
    column: [
      {
        name: 'Seoul',
        data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9],
        colorByCategories: true,
      },
    ],
    line: [
      {
        name: 'Average',
        data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3],
      },
    ],
  },
}
```
![image](https://user-images.githubusercontent.com/30035674/133181927-0a0b4b85-3ada-4cd5-9727-a4a9ce7d01ed.png)


## Options

`options` should be used as an object. Options for each column and line chart must be defined in `column` and `line`, respectively. Available options are as follows.

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
    column?: {
      selectable?: boolean;
      stack?: boolean | {
        type: 'normal' | 'percent';
        connector?: boolean;
      };
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
    };
    line?: {
      selectable?: boolean;
      spline?: boolena;
      showDot?: boolean;
      dataLabels?: {
        visible?: boolean;
        anchor?: DataLabelAnchor;
        offsetX?: number;
        offsetY?: number;
        formatter?: (value) => string;
      }
    }
    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      stackTotal?: {
        visible?: boolean;
        formatter?: (value) => string;
      };
    }
  }
}
```

> Common options that can be used with this chart are not addressed in this document. Refer to the respective options guide.
> (Links:
> [`chart` Options](./common-chart-options.md),
> [Axes](./common-axes.md),
> [Legend](./common-legend.md),
> [Export](./common-exportMenu.md),
> [Tooltip](./common-tooltip.md),
> [`responsive` Options](./common-responsive-options.md),
> [Live Update](./common-liveUpdate-options.md),
> [Column chart](./chart-column.md),
> [Line chart](./chart-line.md)
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

![image](https://user-images.githubusercontent.com/43128697/102773737-14211080-43cd-11eb-83cc-7e5be58a7d85.png)

`selectable` option, accompanied by `on` API's `selectSeries` and `unselectSeries`, grants further control over the series.

### eventDetectType

Defines ways to detect data when the cursor hovers over to display the tooltip and when the mouse is clicked to select a series.

| Type | Details |
| --- | --- |
| `grouped` | All data that are equal with respect to the y-axis are detected. |
| `point` | A single series is detected when a mouse comes within the individual series' detectable area. Only a single series is selected with respect to the current position of the cursor. |

* default: `'grouped'`

![image](https://user-images.githubusercontent.com/43128697/102774021-82fe6980-43cd-11eb-8d01-bf1e5dac7a87.png)

If `eventDetectType: 'point'`, dots from the line series and boxes from the column series are detected individually.

![image](https://user-images.githubusercontent.com/43128697/102773737-14211080-43cd-11eb-83cc-7e5be58a7d85.png)
### column chart options

Options for column charts and line charts are configured in `series.column` and `series.line`, respectively.

```js
const options = {
  series: {
    column: {
      stack: {
        type: 'normal'
      }
    },
    line: {
      showDot: true,
      spline: true
    }
  }

};
```

![image](https://user-images.githubusercontent.com/43128697/102978791-69356180-4548-11eb-8437-d104e3ed6b66.png)

### dataLabels options

If the `series.dataLabels` option is configured, the data labels are displayed for both Column and Line charts.

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

![image](https://user-images.githubusercontent.com/43128697/103477475-a29c8580-4e02-11eb-9749-a744d5d3fce4.png)

Each `series` option can have its own series options, and options related to data labels can be defined in greater detail.

```ts
type ColumnLineChartSeriesOption = {
  column: { // Column series options
    ...
    dataLabels: {
      // Column series data label options
    }
  },
  line: { // Line series options
    ...
    dataLabels: {
      // Line series data label options
    }
  }
};
```

For example, the following code displays the data label for the Column series without displaying the data label for the Line series.

```js
const options = {
  series: {
    column: {
      stack: true,
      dataLabels: {
        visible: true,
        stackTotal: {
          visible: false
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477454-6701bb80-4e02-11eb-8256-23421795972e.png)

## Series Theme

The following is a list of themes that can be modified in the Nested Pie chart. Specifying the data label styles for each Pie series must be done through defining the `series[name].dataLabels`.

In order to style the series separately, do so by defining `series.column` or `series.line`. To apply colors to the series, use the `colors` option; to apply different colors, enter them separately.

```ts
interface ColumnLineChartSeriesTheme {
  colors: string[];
  column: {
    // column chart series themes
  };
  line: {
    // line chart series themes
  };
};
```

The code below is an example of applying various styles to each chart separately.

```js
const theme = {
  theme: {
    series: {
      colors: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#bfe000'],
      column: {
        barWidth: 18
      },
      line: {
        dot: {
          radius: 6,
          borderColor: '#ffff00',
          borderWidth: 2
        }
      }
    }
  }
};
```

The result is as shown below.

![image](https://user-images.githubusercontent.com/43128697/102777876-d6c08100-43d4-11eb-94e5-7b426839aba6.png)

When defining styles for each series' data label, use `series.column.dataLabels` or `series.line.dataLabels`.

```ts
type ColumnLineChartDataLabelTheme = {
  series: {
    column: {
      dataLabels: {
        // Column series data label themes
      }
    },
    line: {
      dataLabels: {
        // Line series data label themes
      }
    }
  }
};
```

The example below modifies the data label font color, size, and weight for the Column series and data label text bubble styles for the Line series.

```js
const options = {
  series: {
    column: {
      dataLabels: { visible: true, anchor: 'start' }
    },
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: -15 }
    }
  },
  theme: {
    series: {
      column: {
        dataLabels: {
          color: '#ffffff',
          fontSize: 10,
          fontWeight: 600
        }
      },
      line: {
        dataLabels: {
          fontSize: 10,
          fontWeight: 300,
          useSeriesColor: true,
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

![image](https://user-images.githubusercontent.com/43128697/103477615-f491db00-4e03-11eb-9207-aa1ee2883aba.png)

> Themes for [Column Chart](./chart-column.md) and [Line Chart](./chart-line.md) can be found in respective guides.
