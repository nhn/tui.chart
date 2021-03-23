# 플롯

플롯은 실제 차트 시리즈가 렌더링 되는 영역이다.

![image](https://user-images.githubusercontent.com/43128697/102863052-5dc53600-4475-11eb-8524-9446529179dd.png)

`plot`이 제공하는 옵션은 다음과 같다.

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

각 옵션이 지원되는 차트는 아래와 같다.

| 이름 | 차트명 |
| --- | --- |
| `width` | 모든 차트 |
| `height` | 모든 차트 |
| `visible` | Scatter, Bubble, Bar, Column, BoxPlot, Bullet, Line, Area, LineArea, LineScatter, ColumnLine |
| `lines` | Line, Area, LineArea, LineScatter, ColumnLine |
| `bands` | Line, Area, LineArea, LineScatter, ColumnLine |

> `width`, `height` 옵션은 플롯 영역의 크기를 변경할 수 있다. 이 가이드에서는 `width`, `height`를 제외한 옵션을 설명하며 해당 옵션은 [레이아웃 설정](./common-layout-options.md) 가이드를 참고하길 바란다.

<br>

`visible` 옵션은 플롯 라인이 표시되는 차트에서 사용할 수 있으며 라인의 가시성을 설정한다. 기본값은 `true`이다.

* 사용 가능 차트 타입: [Bar 차트](./chart-bar.md), [Column 차트](./chart-column.md), [BoxPlot 차트](./chart-boxplot.md), [Bullet 차트](./chart-bullet.md), [Scatter 차트](./chart-scatter.md), [Bubble 차트](./chart-bubble.md), [Line 차트](./chart-line.md), [Area 차트](./chart-area.md), [LineArea 차트](./chart-lineArea.md), [LineScatter 차트](./chart-lineScatter.md), [ColumnLine 처트](./chart-columnLine.md)

 `false`로 설정하면 플롯 영역에 라인이 표시되지 않는다.

```js
const options = {
  plot: {
    visible: false
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102865692-7e8f8a80-4479-11eb-99b6-9b2efe771a4c.png)

<br>

그 외 `lines`, `bands` 옵션은 아래에서 자세히 설명한다.


## lines

`lines` 옵션을 사용하면 플롯 영역에 새로운 라인을 추가할 수 있다.

* 사용 가능 차트 타입 : [Line 차트](./chart-line.md), [Area 차트](./chart-area.md), [LineArea 차트](./chart-lineArea.md), [LineScatter 차트](./chart-lineScatter.md), [ColumnLine 처트](./chart-columnLine.md)

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

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `lines` | line[] | 라인 객체 배열을 정의 |
| `line.value` | number \| string | x축에 대응하는 값 |
| `line.color` | string | 라인 색상 |
| `line.opacity` | number | 라인 투명도 |
| `line.id` | string | 라인 id, `removePlotLine API`를 사용할 때 id 값을 인자로 넘겨주면 해당 라인이 삭제됨 |

사용 방법은 예시를 통해 알아보자.

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

## bands 옵션

`bands` 옵션을 사용하면 플롯 영역에 범위를 지정하여 배경색을 채울 수 있다.

### Line, Area, LineArea, LineScatter, ColumnLine 차트 용

* 사용 가능 차트 타입 : [Line 차트](./chart-line.md), [Area 차트](./chart-area.md), [LineArea 차트](./chart-lineArea.md), [LineScatter 차트](./chart-lineScatter.md), [ColumnLine 차트](./chart-columnLine.md)

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

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `bands` | band[] | 범위 객체 배열 정의 |
| `band.range` | [number, number] \| [string, string] \| [number, number][] \| [string, string][] | x축에 대응하는 값의 범위, 시작과 끝에 해당하는 값을 배열로 입력함 |
| `band.color` | string | 박스 색상 |
| `band.opacity` | number | 박스 색상의 투명도 |
| `band.mergeOverlappingRanges` | boolean | `range`에서 설정한 범위가 겹쳐지는 부분이 있을 때, 박스를 겹쳐서 표시할 지 여부 (기본값: `false`) |
| `band.id` | string | 범위 박스 id, `removePlotBand API`를 사용할 때 id 값을 인자로 넘겨주면 해당 박스가 삭제됨 |

사용 방법은 예시를 통해 알아보자.

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

`mergeOverlappingRanges` 옵션을 `true`로 설정하면 겹쳐지는 부분을 매끄럽게 표현할 수 있다.

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

플롯 영역의 라인 스타일과 배경색을 변경할 수 있다.

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

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `lineColor` | string | 라인 색상 |
| `lineWidth` | number | 라인 두께 |
| `dahsSegments` | number[] | 라인 dashSegment 값 |
| `vertical` | object | 세로형 라인 스타일 설정 |
| `horizontal` | object | 가로형 라인 스타일 설정 |
| `backgroundColor` | string | 플롯 영역 배경색 |

다음은 플롯 테마를 설정하여 라인과 배경색을 변경한 예시이다.

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

### Gauge 용

* 사용 가능 차트 타입 : [Gauge 차트](./chart-gauge.md)

`bands` 옵션을 사용하면 플롯 영역에 범위를 지정하여 배경색을 채울 수 있다.

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

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `bands` | band[] | 범위 객체 배열 정의 |
| `band.range` | [number, number] \| [string, string] \| circular 축에 대응하는 값의 범위, 시작과 끝에 해당하는 값을 배열로 입력함 |
| `band.color` | string | 플롯 섹터 색상 |
| `band.id` | string | 범위 플롯 섹터 id, `removePlotBand API`를 사용할 때 id 값을 인자로 넘겨주면 해당 플롯 섹터가 삭제됨 |

사용 방법은 예시를 통해 알아보자.

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

다음은 Gauge 차트에서 사용할 수 있는 플롯 테마이다. 플롯 범위 영역의 두께를 변경할 수 있다.

```ts
type GaugePlotTheme = {
  bands: {
    barWidth?: number;
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `bands` | object | 범위 영역 테마 |
| `bands.barWidth` | number | 영역 두께 |

다음은 플롯 테마를 설정하여 플롯 범위 영역의 두께를 변경한 예시이다.

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
