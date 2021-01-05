# `responsive` 옵션

`responsive` 옵션을 사용하면 차트의 크기 별로 다른 옵션을 적용할 수 있다. 이 기능은 TOAST UI Chart 4.0의 모든 차트에서 사용할 수 있다.

![image](https://user-images.githubusercontent.com/43128697/103401627-f9008e80-4b8c-11eb-8453-d64fe6830a9a.gif)

## 옵션

`responsive` 옵션은 차트의 크기가 변경되어 다시 그려질 때 애니메이션을 설정할 수 있는 옵션 `animation`과 크기 조건에 해당하는 옵션을 정의할 수 있는 `rules`를 제공한다.

```ts
type ResponsiveOptions = {
  animation?: boolean | { duration: number };
  rules?: {
    condition: ({ width, height }: Size) => boolean;
    options: Options; // 차트 옵션
  }[];
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `animation` | boolean \| object | 애니메이션 설정. 애니메이션을 사용하지 않을 경우 `false`로 지정 |
| `animation.duration` | number | 애니메이션 재생 속도. `0`으로 지정하면 애니메이션 효과가 적용되지 않음 |
| `rules` | rule[] | 차트의 크기 변경 시, 크기 조건과 그 조건에 적용될 옵션을 정의하는 객체. 여러 개를 등록할 수 있음 |
| `rule.condition` | function | 매개변수로 차트의 너비(`width`)와 높이(`height`)을 넘겨줌. 옵션이 적용될 차트의 크기 조건을 작성 |
| `rule.options` | object | `condition` 조건이 성립되었을 때 적용되어야 하는 옵션을 정의 |

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

`responsive` 옵션을 사용하는 경우 `resize` API를 호출해서 차트의 크기를 변경하면 크기 조건에 맞는 미리 정의한 옵션이 자동으로 적용된다.

`chart.width` 또는 `chart.height` 옵션을 `auto`로 설정하면 차트 컨테이너의 크기로 자동으로 설정된다. 만약 차트 컨테이너의 크기를 상댓값으로 설정하면 차트의 크기가 브라우저 창 크기에 따라 자동으로 변경될 것이다. 또한 `responsive` 옵션과 함께 사용하면 창 크기가 변경될 때마다 `updateOptions` API를 따로 호출하지 않아도 차트 크기에 맞는 옵션을 자유롭게 설정해줄 수 있다.

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
