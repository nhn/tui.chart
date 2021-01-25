# `responsive` Option

The `responsive` option allows charts to accept different options according to the charts' sizes. This feature is available on all TOAST UI Chart 4.0 charts.

![image](https://user-images.githubusercontent.com/43128697/103401627-f9008e80-4b8c-11eb-8453-d64fe6830a9a.gif)

## Option

The `responsive` option provides the users with the ability to define the `rules` according to the size of the chart as well as the `animation` for when the charts are repainted.

```ts
type ResponsiveOptions = {
  animation?: boolean | { duration: number };
  rules?: {
    condition: ({ width, height }: Size) => boolean;
    options: Options; // Chart options
  }[];
};
```


| Name | Type | Details |
| --- | --- | --- |
| `animation` | boolean \| object | Configurations for the animation. Set to `false` if not using animation. |
| `animation.duration` | number | Animation play speed. Animation does not play when this is set to `0`. |
| `rules` | rule[] | The rule object defines the options for when the chart's size changes. Multiple options can be applied. |
| `rule.condition` | function | Passes the chart's `width` and `height` as parameters. Represents the chart's size for which the options are applied. |
| `rule.options` | object | Options that take place when the `condition` has been met. |

```js
const options = {
  ...
  responsive: {
    animation: { duration: 300 },
    rules: [
      {
        condition: ({ width: w }) => {
          return w <= 800;
        },
        options: {
          xAxis: {
            tick: { interval: 2 },
            label: { interval: 2 }
          },
          legend: {
            align: 'bottom'
          }
        }
      },
      {
        condition: ({ width: w }) => {
          return w <= 600;
        },
        options: {
          xAxis: {
            tick: { interval: 6 },
            label: { interval: 6 }
          }
        }
      },
      {
        condition: ({ width: w, height: h }) => {
          return w <= 500 && h <= 400;
        },
        options: {
          chart: { title: '' },
          legend: {
            visible: false
          },
          exportMenu: {
            visible: false
          }
        }
      }
    ]
  }
};
```

While the `responsive` option is being used, if the `resize` API is called to change the size of the chart, the predefined options that fit the conditions are automatically applied.

If the `chart.width` or `chart.height` options are set to `auto`, they will be set according to the chart's container size. If the sizes are set relative to the chart's container's sizes, the chart's sizes will change according to the browser's size. Furthermore, when the `responsive` option is applied, the `updateOptions` API does not need to be called every time the size changes to automatically configure the options according to the sizes.

```html
<div id="chart" style="width: 90vw; height: 90vh">
```

```js
const options = {
  chart: { width: 'auto', height:'auto' }
  responsive: {
    rules: [
      ...
    ]
  }
};

const el = document.getElementById('chart');
const chart = toastui.Chart.areaChart({ el, data, options });
```

![image](https://user-images.githubusercontent.com/43128697/103401627-f9008e80-4b8c-11eb-8453-d64fe6830a9a.gif)
