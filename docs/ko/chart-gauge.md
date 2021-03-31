# Gauge 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Gauge 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { GaugeChart } from '@toast-ui/chart';

const chart = new GaugeChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.gaugeChart({el, data, options});
```

## 기본 차트

### 데이터 타입

`series` 값은 `name`과 `data`가 모두 작성된 데이터를 입력해야 한다. `name`은 각각의 시리즈를 구분할 목적으로 사용하는 유일한 id로 작성한다.

```js
const data = {
  series: [
    {
      name: 'Speed',
      data: [80],
    },
  ],
};
```

![gauge-basic](https://user-images.githubusercontent.com/43128697/110775762-a33e1600-82a2-11eb-82cc-594bf41e9638.png)

### 카테고리 데이터 타입

`categories`를 입력하면 Circular Axis에 표시되는 라벨은 카테고리 값이 표시된다.

```js
const data = {
  categories: ['Apple', 'Watermelon', 'Blueberry', 'Grape', 'Orange'],
  series: [
    {
      name: 'Fruit',
      data: ['Orange'],
    },
  ],
};
```

![gauge-basic-with-category](https://user-images.githubusercontent.com/43128697/110789379-26676800-82b3-11eb-966a-d0cb293d87bc.png)

## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
    //...
  }
  circularAxis?: {
    title?: string | {
      text: string;
      offsetX?: number;
      offsetY?: number;
    };
    label?: {
      interval?: number;
      formatter?: (value: string, axisLabelInfo: { axisName: AxisType; labels: string[]; index: number }) => string;
      margin?: number;
    };
    tick?: {
      interval?: number;
    };
    scale?: {
      min?: number;
      max?: number;
      stepSize?: 'auto' | number;
    };
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
    chart?: ChartTheme;
    title?: FontTheme;
    tooltip?: TooltipTheme;
    exportMenu?: ExportMenuTheme;
    circularAxis?: {
      label?: {
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
          textAlign?: CanvasTextAlign;
          borderColor?: string;
          borderWidth?: number;
          shadowColor?: string;
          shadowOffsetX?: number;
          shadowOffsetY?: number;
          shadowBlur?: number;
        };
      };
      lineWidth?: number;
      strokeStyle?: string;
      dotColor?: string;
      title?: {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string | number;
        color?: string;
      };
      tick?: {
        lineWidth?: number;
        strokeStyle?: string;
      };
    };
    plot?: {
      bands?: { barWidth?: number };
    };
    series?: {
      // 아래 챕터에서 설명
    };
  }
  plot?: {
    width?: number | undefined;
    height?: number | undefined;
    bands?: {
      color: string;
      range: number[] | string[];
      id?: string;
    }[];
  };
  series?: {
    solid?: boolean | { clockHand?: boolean };
    selectable?: boolean;
    clockwise?: boolean;
    angleRange?: {
      start?: number;
      end?: number;
    };
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    };
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [플롯](./common-plot.md)
> )

### selectable

해당 시리즈를 선택할 수 있다.

* 기본값: `false`

```js
const options = {
  series: {
    selectable: true
  }
};
```

![gauge-selectable](https://user-images.githubusercontent.com/43128697/110799626-b9f26600-82be-11eb-981f-239cfba4765c.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### clockwise

시리즈가 그려지는 방향을 설정한다. 기본적으로 시계 방향으로 그려지고, `false`로 설정하면 시계 반대 방향으로 그려진다.

* 기본값: `true`

```js
const options = {
  series: {
    clockwise: false
  }
};
```
![gauge-counter-clockwise](https://user-images.githubusercontent.com/43128697/110800382-764c2c00-82bf-11eb-908d-e9d73da946e5.png)

### angleRange

`angleRange`는 `start`와 `end` 옵션을 사용하여 호의 범위를 설정한다.

| 속성 | 설명 |
| --- | --- |
| `angleRange.start` | 호의 시작 각도 (기본값: `0`) |
| `angleRange.end` | 호의 끝 각도 (기본값: `360`) |

```js
const options = {
  series: {
    angleRange: {
      start: 225,
      end: 135,
    }
  }
};
```

![gauge-angleRanges](https://user-images.githubusercontent.com/43128697/110799920-0473e280-82bf-11eb-8533-6f4620f0d59b.png)

### solid

`solid` 옵션은 데이터를 Radial Bar처럼 표현할 수 있다. 차트 데이터가 `series`가 1개이고 `data`가 1개일 때 사용할 수 있다.

* 기본값: `false`

```js
const options = {
  series: {
    solid: true
  }
};
```


![gauge-solid-basic](https://user-images.githubusercontent.com/43128697/110801463-9fb98780-82c0-11eb-9b11-9ef57ded4679.png)

solid 타입으로 시리즈를 표현할 때, 값을 가리키는 시계 바늘(clockHand)의 표시 여부를 설정할 수 있다.

* 기본값: `false`

```js
series: {
  solid: { clockHand: true },
}
```

![gauge-solid-with-clockhand](https://user-images.githubusercontent.com/43128697/110800901-07bb9e00-82c0-11eb-8ad4-4c7b1a250c1b.png)

`series.dataLabels`옵션과 `theme`옵션을 설정하여 아래와 같은 차트를 표현할 수 있다.

![gauge-solid-without-clockhand-on-theme](https://user-images.githubusercontent.com/43128697/110801678-d394ad00-82c0-11eb-895c-ea0ae485d77f.png)


### dataLabels

데이터 라벨은 차트에서 시리즈에 대한 값을 표시한다.
`dataLabels` 옵션은 다음과 같다.

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    };
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![gauge-dataLabels](https://user-images.githubusercontent.com/43128697/110802223-561d6c80-82c1-11eb-8dc2-a412c7e9c8a1.png)

## 시리즈 theme

Gauge 차트에서 수정할 수 있는 시리즈 테마이다. 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 화살표가 없는 말풍선 스타일을 사용할 수 있다.

```ts
interface GaugeChartSeriesTheme {
  colors?: string[];
  areaOpacity?: number;
  solid?: SolidTheme;
  clockHand?: ClockHandTheme;
  pin?: PinTheme;
  hover?: {
    clockHand?: ClockHandTheme;
    pin?: PinTheme;
    solid?: Omit<SolidTheme, 'backgroundSector'>;
  };
  select?: {
    clockHand?: ClockHandTheme;
    pin?: PinTheme;
    solid?: Omit<SolidTheme, 'backgroundSector'>;
    areaOpacity?: number;
    restSeries?: {
      areaOpacity?: number;
    };
  };
  dataLabels?: CommonDataLabelBoxTheme;
}

type ClockHandTheme = {
  color?: string;
  size?: string | number | number[] | string[];
  baseLine?: number;
};

type PinTheme = {
  radius?: number;
  color?: string;
  borderWidth?: number;
  borderColor?: string;
};

type SolidTheme = {
  barWidth?: number | string;
  lineWidth?: number;
  strokeStyle?: string;
  backgroundSector?: { color?: string };
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  color?: string;
};

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

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `colors` | string[] | 시리즈의 색상 |
| `areaOpacity` | number | 모든 시리즈가 활성 되어 있을 때의 전체 영역 투명도 |
| `solid` | object | 시리즈의 섹터 스타일 |
| `solid.barWidth` | object | 시리즈의 섹터 너비 |
| `solid.lineWidth` | number \| string | 시리즈의 섹터 테두리 선 두께 |
| `solid.strokeStyle` | string | 시리즈의 섹터 테두리 선 색 |
| `solid.backgroundSector` | object | 시리즈의 배경 섹터 스타일 |
| `solid.backgroundSector.color` | string | 시리즈의 배경 섹터 색상 |
| `solid.shadowColor` | string | 시리즈의 섹터 그림자 색상 |
| `solid.shadowBlur` | number | 시리즈의 섹터 그림자 Blur |
| `solid.shadowOffsetX` | number | 시리즈의 섹터 Offset X |
| `solid.shadowOffsetY` | number | 시리즈의 섹터 Offset Y |
| `solid.color` | string | 시리즈의 섹터 색상 |
| `clockHand` | object | 시리즈의 시계 바늘 스타일 |
| `clockHand.color` | string | 시리즈의 시계 바늘 색상 |
| `clockHand.size` | number | 시리즈의 시계 바늘 길이 |
| `clockHand.baseLine` | number | 시리즈의 시계 바늘 밑변 길이 |
| `pin` | object | 시리즈의 핀 스타일 |
| `pin.radius` | number | 시리즈의 핀 반지름 |
| `pin.color` | string | 시리즈의 핀 색상 |
| `pin.borderWidth` | number | 시리즈의 핀 테두리 두께 |
| `pin.borderColor` | string | 시리즈의 핀 테두리 색상 |
| `hover` | object | 데이터에 마우스를 올렸을 때 스타일 |
| `select` | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| `dataLabels` | object | 데이터 라벨 스타일 |
| `dataLabels.useSeriesColor` | boolean | 글자 색상을 시리즈 색상으로 사용할지 여부 |
| `dataLabels.lineWidth` | number | 텍스트 선 두께 |
| `dataLabels.textStrokeColor` | string | 텍스트 선 색상 |
| `dataLabels.shadowColor` | string | 텍스트 그림자 색상 |
| `dataLabels.shadowBlur` | number | 텍스트 그림자 Blur |
| `dataLabels.fontSize` | number | 글자 크기 |
| `dataLabels.fontFamily` | string | 폰트명 |
| `dataLabels.fontWeight` | string | 글자 굵기 |
| `dataLabels.color` | string | 글자 색상, `useSeriesColor: true`로 설정한경우 이 옵션은 동작되지 않음 |
| `dataLabels.textBubble` | object | 말풍선 디자인 설정 |
| `dataLabels.textBubble.visible` | boolean | 말풍선 디자인 사용 여부 |
| `dataLabels.textBubble.paddingX` | number | 수평 여백 |
| `dataLabels.textBubble.paddingY`| number | 수직 여백 |
| `dataLabels.textBubble.backgroundColor` | string | 말풍선 배경색 |
| `dataLabels.textBubble.borderRadius` | number | 말풍선 테두리의 둥근 모서리 값 |
| `dataLabels.textBubble.borderColor` | string | 말풍선 테두리 색상 |
| `dataLabels.textBubble.borderWidth` | number | 말풍선 테두리 두께 |
| `dataLabels.textBubble.shadowColor` | string | 말풍선 그림자 색상 |
| `dataLabels.textBubble.shadowOffsetX` | number | 말풍선 그림자 Offset X |
| `dataLabels.textBubble.shadowOffsetY` | number | 말풍선 그림자 Offset Y |
| `dataLabels.textBubble.shadowBlur` | number | 말풍선 그림자 Blur |

테마는 옵션에서 `theme` 옵션을 지정하고 시리즈 테마는 `theme.series`로 설정한다. 아래 코드는 Gauge 시리즈에서 solid 타입을 사용하고 시리즈의 색상과 테두리 스타일을 변경한 옵션이다.

```js
const options = {
  series: {
    solid: true,
  },
  theme: {
    series: {
      colors: [color],
      solid: {
        barWidth: 10,
        lineWidth: 5,
        strokeStyle: '#000',
        backgroundSector: { color: 'rgba(189, 67, 67, 0.1)' },
        hover: {
          color: '#ff0000',
          lineWidth: 5,
          strokeStyle: '#000',
        },
        select: {
          lineWidth: 3,
          strokeStyle: '#000',
        },
      },
    },
  },
};
```

옵션에 대한 결과는 다음과 같다.

![gauge-series-theme](https://user-images.githubusercontent.com/43128697/110804757-ce852d00-82c3-11eb-8642-a5c15ab7979f.png)

아래 코드는 Gauge 차트에서 사용할 수 있는 테마를 적용하여 차트 스타일을 변경한 옵션이다.

```js
const options = {
  chart: { width: 700, height: 400 },
  circularAxis: { title: 'km/h', scale: { min: 0, max: 100 } },
  series: {
    angleRange: {
      start: 270,
      end: 90,
    },
    dataLabels: { visible: true, offsetY: -200, formatter: (value) => `${value} %` },
  },
  plot: {
    bands: [
      { range: [0, 20], color: '#e4a0c2' },
      { range: [20, 50], color: '#dc4d94' },
      { range: [50, 100], color: '#a90757' },
    ],
  },
  theme: {
    chart: { fontFamily: 'Impact' },
    circularAxis: {
      title: { fontWeight: 500, fontSize: 30, color: baseColor },
      label: { color: baseColor, fontSize: 15 },
      tick: { strokeStyle: baseColor },
      strokeStyle: baseColor,
    },
    series: {
      clockHand: {
        color: baseColor,
        baseLine: 10,
      },
      pin: {
        radius: 10,
        color: baseColor,
        borderWidth: 5,
        borderColor: 'rgba(101, 4, 52, 0.3)',
      },
      dataLabels: {
        fontSize: 30,
        color: '#fff',
        textBubble: {
          visible: true,
          backgroundColor: baseColor,
          paddingX: 5,
          paddingY: 5,
        },
      },
    },
    plot: { bands: { barWidth: 50 } },
  },
};
```

![gauge-theme](https://user-images.githubusercontent.com/43128697/110803438-8a455d00-82c2-11eb-8771-8dba322cb193.png)
