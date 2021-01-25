# Common Component Themes

This guide discusses applying themes to common TOAST UI Chart components including chart titles, axes, legends, export menus, tooltips, and plots.

```ts
type Theme = {
  chart?: ChartTheme;
  title?: FontTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  legend?: LegendTheme;
  tooltip?: TooltipTheme;
  plot?: PlotTheme;
  exportMenu?: ExportMenuTheme;
  series?: {
    // More details in respective guides
  };
}
```

## Global Chart Themes

The `theme.chart.fontFamily` option is used to configure fonts that are used with everything in the chart. Fonts for title, axis, label text, and legend are configured using this font. If you use the `theme.chart.backgroundColor` option, you can set the background color of the chart.

**fontFamily**
* default: `'Arial'`

**backgroundColor**
* default: `#ffffff`

```ts
type ChartTheme = {
  fontFamily?: string;
  backgroundColor?: string;
}
```

```js
const options = {
  theme: {
    chart: {
      fontFamily: 'Verdana',
      backgroundColor: 'rgba(9, 206, 115, 0.1)',
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/105469247-47f89a00-5cdb-11eb-9760-8141226604ff.png)

## Chart Title Themes

The `theme.title` can be used to style the chart's title.

```ts
type FontTheme = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
};
```

| Name | Type | Details |
| --- | --- | --- |
| `fontSize` | number | Font size |
| `fontFamily` | string | Font family |
| `fontWeight` | number \| string | Font weight |
| `color` | string | Text color |

```js
const options = {
  theme: {
    title: {
      fontFamily: 'Comic Sans MS',
      fontSize: 45,
      fontWeight: 100,
      color: '#ff416d'
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102843994-c8627b80-444d-11eb-9a24-4144f1b028b8.png)

## Axis Themes

`theme.xAxis` and `theme.yAxis` can be used to style respective axis. It can be used to change the axis title, label, and line styles.

```ts
type AxisTheme = {
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
  width?: number;
  color?: string;
};

type XAxisTheme = AxisTheme;
type YAxisTheme = AxisTheme | AxisTheme[];
```

| Name | Type | Details |
| --- | --- | --- |
| `title` | object | Style configuration for the axis title |
| `label` | object | Style configuration for the axis label |
| `width` | number | Axis line width |
| `color` | string | Axis line color |

```js
const options = {
  theme: {
    xAxis: {
      title: {
        fontFamily: 'Impact',
        fontSize: 15,
        fontWeight: 400,
        color: '#ff416d'
      },
      label: {
        fontFamily: 'fantasy',
        fontSize: 11,
        fontWeight: 700,
        color: '#6EB5FF'
      },
      width: 2,
      color: '#6655EE'
    },
    yAxis: [
      {
        title: {
          fontFamily: 'Impact',
          fontSize: 17,
          fontWeight: 400,
          color: '#03C03C'
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#6655EE'
        },
        width: 3,
        color: '#88ddEE'
      },
      {
        title: {
          fontFamily: 'Comic Sans MS',
          fontSize: 13,
          fontWeight: 600,
          color: '#00a9ff'
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#FFABAB'
        },
        width: 3,
        color: '#AFFCCA'
      }
    ]
  }
};

```

![image](https://user-images.githubusercontent.com/43128697/102844148-20997d80-444e-11eb-87de-22f5abcb75df.png)

## Legend Themes

The `theme.legend` can be used to style texts displayed in the legends.

```ts
type LegendTheme = {
  label?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
};
```

```js
const options = {
  theme: {
    legend: {
      label: {
        fontFamily: 'cursive',
        fontSize: 15,
        fontWeight: 700,
        color: '#ff416d'
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102844255-60f8fb80-444e-11eb-89c1-7644468b2dfb.png)

## Tooptip Themes

The `theme.tooltip` can be used to style the tooltip.

```ts
type TooltipTheme = {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  header?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
  body?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
};
```

| Name | Type | Details |
| --- | --- | --- |
| `background` | string | Background color |
| `borderColor` | string | Border color |
| `borderWidth` | number | Border width |
| `borderStyle` | string | Border style; available options can be found in this [MDN link](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style) |
| `borderRadius` | number | Border radius |
| `header` | object | Styles for text displayed in the tooltip header area |
| `body` | object | Styles for text displayed in the tooltip body area |

```js
const options = {
  theme: {
    tooltip: {
      background: '#80CEE1',
      borderColor: '#3065AC',
      borderWidth: 10,
      borderRadius: 20,
      borderStyle: 'double',
      header: {
        fontSize: 15,
        fontWeight: 700,
        color: '#333333',
        fontFamily: 'monospace',
      },
      body: {
        fontSize: 11,
        fontWeight: 700,
        color: '#a66033',
        fontFamily: 'monospace',
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102844342-969de480-444e-11eb-9ff5-7f3c81062481.png)

## Plot Themes

The `theme.plot` can be used to style the plot's background and lines.

```ts
type PlotTheme = {
  lineColor?: string;
  lineWidth?: number;
  dashSegments?: number[];
  backgroundColor?: string;
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
};
```

| Name | Type | Details |
| --- | --- | --- |
| `lineColor` | string | Line color |
| `lineWidth` | number | Line width |
| `dashSegments` | number[] | dashSegment values for the plot lines |
| `backgroundColor` | string | Background color for the plot area |
| `vertical` | object | Styles for the plot lines drawn vertically |
| `horizontal` | object | Styles for the plot lines drawn horizontally |

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

## Export Menu Themes

The `theme.exportMenu` can be used to style the export button and the menu box.

```ts
type ExportMenuTheme = {
  button?: {
    backgroundColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    xIcon?: {
      color?: string;
      lineWidth?: number;
    };
    dotIcon?: {
      color?: string;
      width?: number;
      height?: number;
      gap?: number;
    };
  };
  panel?: {
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    header?: {
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string | number;
      color?: string;
      backgroundColor?: string;
    };
    body?: {
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string | number;
      color?: string;
      backgroundColor?: string;
    };
  };
};
```

| Name | Type | Details |
| --- | --- | --- |
| `button` | object | Styles used for the export button |
| `button.backgroundColor` | string | Button background color |
| `button.borderRadius` | number | Button border radius |
| `button.borderWidth` | number | Button border width |
| `button.borderColor` | string | Button border color |
| `button.xIcon` | object | Styles used for the x icon |
| `button.dotIcon` | object | Styles used for the dot icon |
| `panel` | object | Styles used for the panel that is displayed when the export button is clicked |
| `panel.borderRadius` | number | Menu panel border radius |
| `panel.borderWidth` | number | Menu panel border width |
| `panel.borderColor` | string | Menu panel border color |
| `panel.header` | object | Styles used for the menu panel header |
| `panel.body` | object | Styles used for the menu panel body |

```js
const options = {
  theme: {
    exportMenu: {
      button: {
        backgroundColor: '#ff0000',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#000000',
        xIcon: {
          color: '#ffffff',
          lineWidth: 3,
        },
        dotIcon: {
          color: '#ffffff',
          width: 10,
          height: 3,
          gap: 1,
        },
      },
      panel: {
        borderColor: '#ff0000',
        borderWidth: 2,
        borderRadius: 10,
        header: {
          fontSize: 15,
          fontFamily: 'fantasy',
          color: '#ffeb3b',
          fontWeight: 700,
          backgroundColor: '#673ab7',
        },
        body: {
          fontSize: 12,
          fontFamily: 'fantasy',
          color: '#ff0000',
          fontWeight: '500',
          backgroundColor: '#000000',
        },
      },
    },
  },
};
```

| Before Click | After Click |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/102844540-04e2a700-444f-11eb-83c5-8bc6cd756396.png) | ![image](https://user-images.githubusercontent.com/43128697/102844549-07dd9780-444f-11eb-88e7-5fa2f2d54ca4.png) |
