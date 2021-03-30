# Plot

The plot is the area where the actual chart series is rendered.

![image](https://user-images.githubusercontent.com/43128697/102863052-5dc53600-4475-11eb-8524-9446529179dd.png)

The following is a list of options available with the `plot`.

```ts
type PlotOption = {
  width?: number;
  height?: number;
  visible?: boolean;
  lines?: {
    value: number | string;
    color: string;
    opacity?: number;
    id?: string;
  }[];
  bands?: {
    range: [number, number] | [string, string] | [number, number][] | [string, string][];
    color: string;
    opacity?: number;
    mergeOverlappingRanges?: boolean;
    id?: string;
  }[];
};
```

The charts that support each option are as follows.

| Option Name | Chart Name |
| --- | --- |
| `width` | All charts |
| `height` | All charts |
| `visible` | Scatter, Bubble, Bar, Column, BoxPlot, Bullet, Line, Area, LineArea, LineScatter, ColumnLine |
| `lines` | Line, Area, LineArea, LineScatter, ColumnLine |
| `bands` | Line, Area, LineArea, LineScatter, ColumnLine |

> `width` and `height` options can change the size of the plot area. This guide does not discuss `width` and `height`, so consult the [Layout](./common-layout-options.md) for details.

<br>

The `visible` option can be used with charts that show plot lines and can decide whether to display the lines. The default value is set to `true`.

* Compatible with: [Bar chart](./chart-bar.md), [Column chart](./chart-column.md), [BoxPlot chart](./chart-boxplot.md), [Bullet chart](./chart-bullet.md), [Scatter chart](./chart-scatter.md), [Bubble chart](./chart-bubble.md), [Line chart](./chart-line.md), [Area chart](./chart-area.md), [LineArea chart](./chart-lineArea.md), [LineScatter chart](./chart-lineScatter.md), [ColumnLine chart](./chart-columnLine.md)

 Setting it to be `false` will make it so that the lines are not displayed in the plot areas.


```js
const options = {
  plot: {
    visible: false
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102865692-7e8f8a80-4479-11eb-99b6-9b2efe771a4c.png)

<br>

Options `lines` and `bands` are explained in greater detail below.

## lines
The `lines` option can be used to add new lines to the plot area.

* Compatible with : [Line chart](./chart-line.md), [Area chart](./chart-area.md), [LineArea chart](./chart-lineArea.md), [LineScatter chart](./chart-lineScatter.md), [ColumnLine chart](./chart-columnLine.md)

```ts
type PlotOption = {
  ...
  lines?: {
    value: number | string;
    color: string;
    opacity?: number;
    id?: string;
  }[];
};
```


| Name | Type | Details |
| --- | --- | --- |
| `lines` | line[] | Defines the array of line objects |
| `line.value` | number \| string | Value that corresponds to the x axis |
| `line.color` | string | Line color |
| `line.opacity` | number | Line opacity |
| `line.id` | string | Line id; when passed to `removePlotLine API`, the corresponding line is deleted |

For usage information, refer to the following example.

```js
const options = {
  plot: {
    ...
    lines: [
      {
        value: 4,
        color: '#1467e4',
      },
      {
        value: 10,
        color: '#fa2828',
      }
    ]
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102869301-c06eff80-447e-11eb-9762-f71671843695.png)

## bands

The `bands` option can be used to color the background of a predefined area within the plot.

### For Line, Area, LineArea, LineScatter, ColumnLine Charts

* Compatible with : [Line chart](./chart-line.md), [Area chart](./chart-area.md), [LineArea chart](./chart-lineArea.md), [LineScatter chart](./chart-lineScatter.md), [ColumnLine chart](./chart-columnLine.md)

```ts
type PlotOption = {
  ...
  bands?: {
    range: [number, number] | [string, string] |<br> [number, number][] | [string, string][];
    color: string;
    opacity?: number;
    mergeOverlappingRanges?: boolean;
    id?: string;
  }[];
};
```

| Name | Type | Details |
| --- | --- | --- |
| `bands` | band[] | Defines the array of bands objects |
| `band.range` | [number, number] \| [string, string] \| [number, number][] \| [string, string][] | Values that correspond to the x-axis; entered in the array in the order of starting value and ending value |
| `band.color` | string | Box color |
| `band.opacity` | number | Box color opacity |
| `band.mergeOverlappingRanges` | boolean | Determines whether to display overlapping bands when there are overlapping values in the `range` (default: `false`) |
| `band.id` | string | Band id; when passed to `removePlotBand`, the corresponding band is deleted |

For usage information, refer to the following example.

```js
const options = {
  plot: {
    bands: [
      {
        range: [
          ['08/22/2020 10:35:00', '08/22/2020 10:45:00'],
          ['08/22/2020 10:40:00', '08/22/2020 10:55:00'],
        ],
        color: '#00bcd4',
        opacity: 0.2
      },
      {
        range: [['08/22/2020 10:05:00', '08/22/2020 10:15:00']],
        color: '#ff5722',
        opacity: 0.1
      }
    ]
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102870143-f496f000-447f-11eb-8fd6-94e60a136e76.png)


When `mergeOverlappingRanges` option is set to `true`, overlapping areas can be displayed naturally.

```js
const options = {
  plot: {
    bands: [
      {
        range: [
          ['08/22/2020 10:35:00', '08/22/2020 10:45:00'],
          ['08/22/2020 10:40:00', '08/22/2020 10:55:00'],
        ],
        color: '#00bcd4',
        opacity: 0.2,
        mergeOverlappingRanges: false
      },
      ...
    ]
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102870505-72f39200-4480-11eb-8b24-4ba2a7242556.png)

#### theme

Themes can be used to change the line style and the background color for the plot area.

```ts
type PlotTheme = {
  lineColor?: string;
  lineWidth?: number;
  dashSegments?: number[];
  vertical?: {
    lineColor?: string;
    lineWidth?: number;
    dashSegments?: number[];
  };
  horizontal?: {
    lineColor?: string;
    lineWidth?: number;
    dashSegments?: number[];
  };
  backgroundColor?: string;
};
```

| Name | Type | Details |
| --- | --- | --- |
| `lineColor` | string | Line color |
| `lineWidth` | number | Line width |
| `dahsSegments` | number[] | Line dashSegment value |
| `vertical` | object | Styles used for vertical lines |
| `horizontal` | object | Styles used for horizontal lines |
| `backgroundColor` | string | Plot area background color |

The following is an example of changing the line color and the background color by configuring the plot themes.

```js
const options = {
  theme: {
    plot: {
      vertical: {
        lineColor: 'rgba(60, 80, 180, 0.3)',
        lineWidth: 5,
        dashSegments: [5, 20],
      },
      horizontal: {
        lineColor: 'rgba(0, 0, 0, 0)',
      },
      backgroundColor: 'rgba(60, 80, 180, 0.1)'
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102844399-bb925780-444e-11eb-9bd5-4c10471d1d6b.png)

### For Gauge Chart

* Compatible with : [Gauge chart](./chart-gauge.md)


```ts
type GaugePlotOption = {
  ...
  bands?: {
    range: [number, number] | [string, string];
    color: string;
    id?: string;
  }[];
};
```

| Name | Type | Details |
| --- | --- | --- |
| `bands` | band[] | Defines the array of bands objects |
| `band.range` | [number, number] \| [string, string] \| Values that correspond to the circular-axis; entered in the array in the order of starting value and ending value |
| `band.color` | string | Plot sector color |
| `band.id` | string | Band id; when passed to `removePlotBand`, the corresponding band is deleted |

For usage information, refer to the following example.

```js
const options = {
  ...
  plot: {
    bands: [
      { range: [0, 20], color: '#55bf3b' },
      { range: [20, 50], color: '#dddf0d' },
      { range: [50, 110], color: '#df5353' },
    ]
  }
};
```

![gauge-plot](https://user-images.githubusercontent.com/43128697/110775818-b3ee8c00-82a2-11eb-8233-2b915489735f.png)

#### theme

The following are plot themes that can be used in Gauge charts. You can change the thickness of the plot range area.


```ts
type GaugePlotTheme = {
  bands: {
    barWidth?: number;
  };
};
```

| Name | Type | Details |
| --- | --- | --- |
| `bands` | object | Band theme |
| `bands.barWidth` | number | Band width |


The following is an example of changing the thickness of the plot area by setting the plot theme.

```js
const options = {
  theme: {
    plot: {
      { bands: { barWidth: 30 } }
    }
  }
};
```

![gauge-plot-theme](https://user-images.githubusercontent.com/43128697/110794737-65002100-82b9-11eb-9607-dc443700dac3.png)
