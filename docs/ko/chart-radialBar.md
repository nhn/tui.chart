# RadialBar 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

RadialBar 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { RadialBarChart } from '@toast-ui/chart';

const chart = new RadialBarChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.radialBarChart({el, data, options});
```

## 기본 차트

### 데이터 타입

`categories` 값은 Y축의 틱에 나타나며 `series` 값은 `name`과 `data`가 모두 작성된 데이터를 입력해야 한다. `name`은 각각의 시리즈를 구분할 목적으로 사용하는 유일한 id로 작성한다.

```js
const data = {
  categories: ['Korea', 'United States', 'Germany', 'Canada', 'Austria'],
  series: [
    {
      name: 'Gold medals',
      data: [132, 105, 92, 73, 64]
    },
    {
      name: 'Silver medals',
      data: [125, 110, 86, 64, 81]
    },
    {
      name: 'Bronze medals',
      data: [111, 90, 60, 62, 87]
    }
  ]
};
```

![radial-bar-basic](https://user-images.githubusercontent.com/43128697/107403382-64545d80-6b48-11eb-8c85-e2b433ad7a74.png)

## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
    //...
  }
  verticalAxis?: {
    label?: {
      interval?: number;
      formatter?: (value: string, axisLabelInfo: { axisName: AxisType; labels: string[]; index: number }) => string;
      margin?: number;
    };
    tick?: {
      interval?: number;
    };
  }
  circularAxis?: {
    label?: {
      interval?: number;
      formatter?: (value: string, axisLabelInfo: { axisName: AxisType; labels: string[]; index: number }) => string;
      margin?: number;
    };
    tick?: {
      interval?: number;
    };
    scale: {
      min?: number;
      max?: number;
      stepSize?: 'auto' | number;
    };
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
    // 아래 테마 챕터에서 설명
  }
  series?: {
    selectable?: boolean;
    eventDetectType?: 'point' | 'grouped';
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
      formatter?: (value) => string;
    };
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive` 옵션](./common-responsive-options.md)
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

![radial-bar-selectable-point](https://user-images.githubusercontent.com/43128697/107403655-b8f7d880-6b48-11eb-9ce5-2c64990f9d87.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### eventDetectType

마우스를 통해 시리즈 데이터를 선택하거나 탐지하는 방법을 정의한다.

| 타입 | 설명 |
| --- | --- |
| `point` | 개별 시리즈 영역에 마우스가 다가가야 탐지. 현재 마우스가 가리키고 있는 포인트를 기준으로 단 한 개만 탐지됨 |
| `grouped` | Y축을 기준으로 값이 같은 모든 데이터가 탐지됨 |

* 기본값: `point`

![radial-bar-selectable-point](https://user-images.githubusercontent.com/43128697/107403655-b8f7d880-6b48-11eb-9ce5-2c64990f9d87.png)

`eventDetectType`을 `'grouped'`로 설정할 경우 Y축을 기준으로 값이 같은 데이터가 모두 탐지된다.

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```

![radial-bar-eventDetectType.grouped](https://user-images.githubusercontent.com/43128697/107985089-b7c52080-700c-11eb-8a14-8bb01696ac38.png)

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
![radia-bar-counter-clockwise](https://user-images.githubusercontent.com/43128697/107404237-6bc83680-6b49-11eb-8671-27135076b2d0.gif)

### radiusRange

`radiusRange`는 `inner`와 `outer` 옵션을 지정하여 안쪽 원의 반지름과 바깥쪽 원의 반지름을 설정한다. `inner`의 기본값은 `0`이다. 0보다 큰 값을 입력하면 도넛 모양의 차트를 만들 수 있다.

| 속성 | 설명 |
| --- | --- |
| `radiusRange.inner` | 안쪽의 반지름 설정 |
| `radiusRange.outer` | 바깥쪽의 반지름 설정 |

값을 `%`를 포함한 문자열 타입으로 입력하면 비율로 계산한다.

```js
const options = {
  series: {
    radiusRange: {
      inner: '20%',
      outer: '80%',
    }
  }
};
```

![radial-bar-radiusRange-percent](https://user-images.githubusercontent.com/43128697/107406157-78e62500-6b4b-11eb-9acb-be8c9e20e6b9.png)

값을 숫자 타입으로 입력하면 반지름은 절대값으로 계산된다.

```js
const options = {
  series: {
    radiusRange: {
      inner: 40,
      outer: 200,
    }
  }
};
```

![radial-bar-radiusRange-px](https://user-images.githubusercontent.com/43128697/107406353-b21e9500-6b4b-11eb-9e5e-eb7e15c2752e.png)

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
      start: 45,
      end: 315,
    }
  }
};
```

![radial-bar-angleRanges](https://user-images.githubusercontent.com/43128697/107982838-15a33980-7008-11eb-9600-5138faf117f6.png)

### dataLabels

데이터 라벨은 차트에서 시리즈에 대한 값을 표시한다.
`dataLabels` 옵션은 다음과 같다.

```ts
type options = {
  ...
  series: {
    dataLabels: {
      visible?: boolean;
      anchor?: 'center' | 'outer';
      formatter?: (value) => string;
    };
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |
| `anchor` | 'start' \| 'center' \| 'end' | 데이터 라벨 표시 위치 설정. (기본값: `'center'`) |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

```js
// start anchor 적용
const options = {
  series: {
    dataLabels: {
      visible: true,
      anchor: 'start'
    }
  }
};
```

| center anchor 적용(기본) | start anchor 적용 | end anchor 적용 |
| --- | --- | --- |
| ![radial-bar.datalabels.anchor.center](https://user-images.githubusercontent.com/43128697/107407095-94056480-6b4c-11eb-83b6-2d63e935fa71.png) | ![radial-bar.datalabels.anchor.start](https://user-images.githubusercontent.com/43128697/107407117-9a93dc00-6b4c-11eb-99d5-40770d326bac.png) | ![radial-bar.datalabels.anchor.end](https://user-images.githubusercontent.com/43128697/107407103-9667be80-6b4c-11eb-9a72-18bed754ce49.png) |

## 시리즈 theme

RadialBar 차트에서 수정할 수 있는 시리즈 테마이다. 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 화살표가 없는 말풍선 스타일을 사용할 수 있다.

```ts
interface RadialBarChartSeriesTheme {
  colors?: string[];
  barWidth?: number | string;
  areaOpacity?: number;
  lineWidth?: number;
  strokeStyle?: string;
  hover?: {
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    color?: string;
    groupedSector?: {
      color?: string;
      opacity?: number;
    };
  };
  select?: {
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    color?: string;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
    groupedSector?: {
      color?: string;
      opacity?: number;
    };
  };
  dataLabels?: CommonDataLabelBoxTheme;
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

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `colors` | string[] | 시리즈의 색상 |
| `barWidth` | number | 시리즈 너비 |
| `areaOpacity` | number | 모든 시리즈가 활성 되어 있을 때의 전체 영역 투명도 |
| `lineWidth` | number | 시리즈의 테두리 선 너비 |
| `strokeStyle` | string | 시리즈의 테두리 선 색 |
| `hover` | object | 데이터에 마우스를 올렸을 때 스타일 |
| `hover.groupedSector` | object | 옵션 `series.eventDetectType: 'grouped'`로 설정되어 있을 때, Y축 기준으로 덮어지는 박스 영역의 스타일 |
| `select` | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| `select.groupedSector` | object | 옵션 `series.eventDetectType: 'grouped'`로 설정되어 있을 때, Y축 기준으로 선택되는 박스 영역의 스타일 |
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

테마는 옵션에서 `theme` 옵션을 지정하고 시리즈 테마는 `theme.series`로 설정한다. 간단한 예시로 시리즈의 색상과 테두리 스타일을 변경하고 마우스를 올렸을 때 그림자 효과를 적용해보자.

```js
const options = {
  theme: {
    series: {
      colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'],
      lineWidth: 2,
      strokeStyle: '#000000',
      hover: {
        strokeStyle: '#000000',
        lineWidth: 2,
        shadowColor: '#000000',
        shadowBlur: 6
      }
    }
  }
};
```

옵션에 대한 결과는 다음과 같다.

![radial-bar-series-theme](https://user-images.githubusercontent.com/43128697/107407956-aa5ff000-6b4d-11eb-8d98-fd2246642139.png)

아래 코드는 데이터 라벨 테마를 적용하여 글자 스타일을 변경한 옵션이다.

```js
const options = {
  series: {
    dataLabels: { visible: true }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 12,
        fontWeight: 600,
        useSeriesColor: true,
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 6
      }
    }
  }
};
```

![radial-bar-series-datalabels-theme](https://user-images.githubusercontent.com/43128697/107408215-0165c500-6b4e-11eb-9a8a-5fa47756b770.png)
