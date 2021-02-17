# Axes

The axes serve to facilitate the understanding of the graph by displaying secondary ticks and the overview of the values.

![image](https://user-images.githubusercontent.com/35371660/102475360-1ddd0800-409d-11eb-96eb-6421f58fb1cb.png)

Axes available with TOAST UI Chart are x-axis, y-axis, secondary y-axis. There are more axis available given the type of the chart.

| Type                                       | Chart Name                                                     |
| ------------------------------------------ | -------------------------------------------------------------- |
| x-axis, y-axis, secondary y-axis available | `Area`, `Bar`, `ColumnLine`, `LineArea`, `Line`, `LineScatter` |
| x-axis, y-axis available                   | `BoxPlot`, `Bubble`, `Bullet`, `Column`, `Heatmap`, `Scatter`  |
| No axis                                    | `Radar`, `Treemap`, `Pie`, `NestedPie`                         |

This guide assumes to use a type of chart with all available axes.

## Options

Options that can be modified for axes are as follows.

```ts
interface AxisOptions {
  tick?: {
    interval?: number;
  };
  label?: {
    interval?: number;
    formatter?: (
      value: string,
      axisLabelInfo: {
        axisName: 'xAxis' | 'yAxis' | 'secondaryYAxis';
        labels: string[];
        index: number;
      }
    ) => string;
    margin?: number;
  };
  scale?: {
    min?: number;
    max?: number;
    stepSize?: 'auto' | number;
  };
  title?:
    | string
    | {
    text: string;
    offsetX?: number;
    offsetY?: number;
  };
  width?: number;
  height?: number;
}

interface xAxisOptions extends AxisOptions {
  pointOnColumn?: boolean; // Only available on Line, Area Chart
  date?:
    | boolean
    | {
    format: string;
  };
  label?: {
    interval?: number;
    rotatable?: boolean;
    formatter?: (
      value: string,
      axisLabelInfo: {
        axisName: 'xAxis' | 'yAxis' | 'secondaryYAxis';
        labels: string[];
        index: number;
      }
    ) => string;
    margin?: number;
  };
}
```

### tick, label

`tick` and `label` options can be used to adjust the information regarding the gradations and the separation of labels. Both options can take `interval` values, and this numeric value determines the separation.

```js
const options = {
  xAxis: {
    tick: {
      interval: 3,
    },
    label: {
      interval: 6,
    },
  },
};
```

Applying the above example allows users to simplify the axis as such.

![image](https://user-images.githubusercontent.com/35371660/102288746-78cd0d00-3f80-11eb-8479-8b882cb39149.png)

### scale

The scale option can be used to define the minimum and the maximum values to be displayed on the axes as well as the separation between the ticks and labels. Each can be done through `scale.min`, `scale.max`, and `scale.stepSize`, and if undeclared, it is defined automatically by the chart.

```js
const options = {
  yAxis: {
    scale: {
      min: 20,
      max: 50,
      stepSize: 10,
    },
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102288615-34da0800-3f80-11eb-89a1-68b2862ffd5d.png)

### title

As is evident from the image, each chart takes a title. The `title` option can be entered directly as a string, and options like `title.text`, `title.offsetX`, `title.offsetY` can be used to change the title and the location of the title.

```js
const options = {
  xAxis: {
    title: {
      text: 'new title',
      offsetX: 100,
      offsetY: 100,
    },
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102191824-4af2b480-3efd-11eb-87c0-9a5ec4c9296b.png)

### date

The category value displayed on the x-axis can take the form of a Date object or a string that represents a date. In order to handle the data internally, user must declare the `xAxis.date` object to be `true` or `xAxis.date.format` when using date data.

| Type     | Available Formats          |
| -------- | -------------------------- |
| year     | `YYYY`, `YY`, `yy`, `yyyy` |
| month    | `MMMM`, `MMM`, `MM`, `M`   |
| date     | `D`, `d`, `DD`, `dd`       |
| hour     | `hh`, `HH`, `h`, `H`       |
| minute   | `m`, `mm`                  |
| seconds  | `s`, `ss`                  |
| meridiem | `A`, `a`                   |

Let's see how this option works in an example.

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
  series: [ ... ]
}

const options = {
  xAxis: {
    date: {
      format: 'YY-MM-DD'
    }
  }
}
```

The Date type category is displayed according to the formatting.

![image](https://user-images.githubusercontent.com/35371660/102196061-bab76e00-3f02-11eb-8be2-d480b9810113.png)

## formatter

The `axis.label.formatter` option can be used to format the data before the data is displayed. The formatting function takes the values and axis label information as parameters and returns the formatted string.

Let's write a simple example that compares the entered values and adds an emoji.

```js
const options = {
  xAxis: {
    label: {
      formatter: (value) => {
        const index = Number(value.split('-')[1]);
        const animals = ['🐶', '🐱', '🦊', '🐻'];

        return `${animals[index % animals.length]} ${value}`;
      },
    },
    date: {
      format: 'YY-MM-DD',
    },
  },
  yAxis: {
    label: {
      formatter: (value) => {
        if (value < 0) {
          return `${value} ❄️`;
        }
        if (value > 25) {
          return `${value} 🔥`;
        }

        return `️${value} ☀️`;
      },
    },
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/104884143-35175a00-59a9-11eb-8711-eca42f0f483c.png)

### rotateLabel

- ⚠️ Not Yet Developed ⚠️

### pointOnColumn

Allows users to shift the starting point of the series to the midpoint with respect to the x-axis. This option is only available in [Line Chart](./chart-line.md) and [Area Chart](./chart-area.md).

- default: `false`

```js
const options = {
  xAxis: {
    pointOnColumn: true,
  },
};
```

**`Line Chart with `pointOnColumn: true` applied**
![image](https://user-images.githubusercontent.com/35371660/101850121-76dc0600-3b9c-11eb-867d-3bc47bd476f7.png)

**`Area Chart with `pointOnColumn: true` applied**
![image](https://user-images.githubusercontent.com/35371660/101856997-d8ef3800-3ba9-11eb-9caf-8b4bca816836.png)

### margin

`axis.label.margin` is an option used to add margin between the label and the axis. It can be adjusted through numeric values, and only positive numbers are possible for the y axis.

- default: `0`

Let's write a simple example that use label margin.

```js
const options = {
  xAxis: {
    margin: 40
  },
  yAxis: {
    margin: 50
  }
};
```

![image](https://user-images.githubusercontent.com/35371660/105459947-64daa080-5cce-11eb-90ed-bb36c90a8879.png)

## Theme

Theme options that can be used to style the axes are as follows.

```ts
interface AxisTheme {
  width?: number;
  color?: string;
  title?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
  label?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
}
```

| Name  | Type   | Details                         |
| ----- | ------ | ------------------------------- |
| width | number | Width of the axis               |
| color | string | Color of the axis               |
| title | object | Theme option for the axis title |
| label | object | Theme option for the axis label |

Theme can be added through the option's `theme` value. Let's write a simple example that changes the width, color, and the label of the y-axis.

```js
const options = {
  theme: {
    yAxis: {
      label: {
        color: '#ff2233',
        fontWeight: 600,
        fontFamily: 'monaco',
        fontSize: 14,
      },
      width: 3,
      color: '#00ff32',
    },
  },
};
```

The resulting style is shown below.

![image](https://user-images.githubusercontent.com/35371660/102197823-01a66300-3f05-11eb-9668-6b4a53b83cb6.png)

## Secondary Y Axis

`Area`, `Bar`, `ColumnLine`, `LineArea`, `Line`, and `LineScatter`charts can be used with a secondary y-axis. To apply options for the secondary y-axis, provide an array of options for the `yAxis` option. The first option will be applied to the main axis, and the second option will be applied to the secondary axis.

```js
const options = {
  yAxis: [
    {
      title: 'Temperature (Celsius)',
    },
    {
      title: 'Percent (%)',
      scale: {
        min: 0,
        max: 100,
      },
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/35371660/102289947-45d84880-3f83-11eb-94ce-8b8e6bead8e8.png)

`ColumnLine`, `LineArea`, and `LineScatter` charts can be specified `chartType`, values can be displayed on each axis according to the chart type, and each `scale` can also be specified.

```js
const options = {
  yAxis: [
    {
      title: 'Energy (kWh)',
      chartType: 'line'
    },
    {
      title: 'Powered Usage',
      chartType: 'area',
      scale: {
        min: 0,
        max: 700
      },
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/35371660/107331939-ddc36000-6af6-11eb-8e11-6d1ffb2c632f.png)

Themes can also be applied to both y-axes when provided as an array. The first option will be applied to the main axis, and the second option will be applied to the secondary axis.

```js
const options = {
  theme: {
    yAxis: [
      {
        title: {
          fontFamily: 'Impact',
          fontSize: 17,
          fontWeight: 400,
          color: '#03C03C',
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#6655EE',
        },
        width: 3,
        color: '#88ddEE',
      },
      {
        title: {
          fontFamily: 'Comic Sans MS',
          fontSize: 13,
          fontWeight: 600,
          color: '#00a9ff',
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#FFABAB',
        },
        width: 3,
        color: '#AFFCCA',
      },
    ],
  },
};
```

![image](https://user-images.githubusercontent.com/35371660/102290775-090d5100-3f85-11eb-9181-3ad214d50407.png)
