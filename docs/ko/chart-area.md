# Area 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Area 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { AreaChart } from '@toast-ui/chart';

const chart = new AreaChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.AreaChart({el, data, options});
```

## 기본 차트

### 데이터 타입

`categories` 값은 x축의 틱에 나타나며 `series` 값은 `name`과 `data`가 모두 작성된 데이터를 입력해야 한다. `name`은 각각의 시리즈를 구분할 목적으로 사용하는 id로 유일한 id로 작성한다.

```js
const data = {
  categories: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  series: [
    {
      name: 'Seoul',
      data: [20, 40, 25, 50, 15, 45, 33, 34, 20, 30, 22, 13],
    },
    {
      name: 'Sydney',
      data: [5, 30, 21, 18, 59, 50, 28, 33, 7, 20, 10, 30],
    },
    {
      name: 'Moscow',
      data: [30, 5, 18, 21, 33, 41, 29, 15, 30, 10, 33, 5],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/101856128-0aff9a80-3ba8-11eb-9ad0-107dc8261cb0.png)

## range 차트

### 데이터 타입

기본 차트와 다른 점은 series data의 타입이다. data는 `배열`로 입력되며 값의 시작과 끝을 `숫자값`으로 순서대로 넣어줘야 한다.

```js
const data = {
  categories: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  series: [
    {
      name: 'Seoul',
      data: [
        [-8.3, 0.3],
        [-5.8, 3.1],
        [-0.6, 9.1],
        [5.8, 16.9],
        [11.5, 22.6],
        [16.6, 26.6],
        [21.2, 28.8],
        [21.8, 30.0],
        [15.8, 25.6],
        [8.3, 19.6],
        [1.4, 11.1],
        [-5.2, 3.2],
      ],
    },
  ],
}
```

![image](https://user-images.githubusercontent.com/35371660/101856365-78133000-3ba8-11eb-999a-a7cb82755c6c.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다. 
기본 차트와 range 차트 모두 사용하는 방법은 동일하다.

```js
const data = {
  categories: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  series: [
    {
      name: 'Seoul',
      data: [20, 40, 25, 50, 15, 45, 33, 34, 20, 30, 22, 13],
      visible: false,
    },
    {
      name: 'Sydney',
      data: [5, 30, 21, 18, 59, 50, 28, 33, 7, 20, 10, 30],
    },
    {
      name: 'Moscow',
      data: [30, 5, 18, 21, 33, 41, 29, 15, 30, 10, 33, 5],
    },
  ],
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/35371660/108007541-9894b600-7041-11eb-8e5f-0010dba85f65.png)


## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
    // ...
  },
  xAxis?: {
    // ...
  },
  yAxis?: {
    // ...
  },
  legend?: {
    // ...
  },
  exportMenu?: {
    // ...
  },
  tooltip?: {
    // ...
  },
  plot?: {
    // ...
  },
  responsive?: {
    // ...
  },
  theme?: {
    // 아래 테마 챕터에서 설명
  },
  series?: {
    showDot?: boolean;
    spline?: boolean;
    zoomable?: boolean;
    eventDetectType?: 'near' | 'nearest' | 'grouped';
    shift?: boolean;
    stack?: boolean | {
      type: 'normal' | 'percent';
    }
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    }
  }
};
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [플롯](./common-plot.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [실시간 업데이트](./common-liveUpdate-options.md)
> )

### stack

`stack` 옵션을 통해 시리즈들이 쌓인 형태인 스택 차트를 만들 수 있다. 스택 차트는 `normal` 타입과 `percent` 타입이 존재한다.
### normal 타입

![image](https://user-images.githubusercontent.com/35371660/101857653-57000e80-3bab-11eb-8cc3-8c349cebb9dd.png)

```js
const options = {
  series: {
    stack: {
      type: 'normal'
    }
  }
}
```

### percent 타입

![image](https://user-images.githubusercontent.com/35371660/101857706-74cd7380-3bab-11eb-9a23-168006a07b2c.png)

```js
const options = {
  series: {
    stack: {
      type: 'percent'
    }
  }
}
```

### selectable

![image](https://user-images.githubusercontent.com/35371660/101856948-b9580f80-3ba9-11eb-9db2-86cbef233bc8.png)

* 기본값: `false`

해당 시리즈를 선택할 수 있다.

```js
const options = {
  series: {
    selectable: true
  }
};
```

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### spline

![image](https://user-images.githubusercontent.com/35371660/101857048-f9b78d80-3ba9-11eb-80a1-e28c84f8fd6e.png)

* 기본값: `false`

시리즈 선을 부드러운 spline 곡선으로 만들 수 있다.

```js
const options = {
  series: {
    spline: true
  }
}
```

### eventDetectType

![image](https://user-images.githubusercontent.com/35371660/101857092-105de480-3baa-11eb-828f-6a1196431c97.png)

* 기본값: `nearest`

툴팁에 나타낼 데이터를 탐지하는 방법을 정의할 수 있다.


| 타입 | 설명 |
| --- | --- |
| `near` | 데이터 영역의 일정 범위에 마우스가 다가가야 탐지. 일정 영역 내에 여러 데이터가 있을 경우 모두 한꺼번에 탐지됨 |
| `nearest` | 차트 내 모든 영역에서 이벤트 탐지. 마우스를 기준으로 가장 가까운 시리즈가 탐지됨  |
| `grouped` | x축을 기준으로 값이 같은 모든 데이터가 탐지됨 |
| `point` | 시리즈 데이터 점 영역에 마우스를 올릴 경우 탐지 됨 |

```js
const options = {
  series: {
    eventDetectType: 'grouped'
  }
};
```
### zoomable

![area-zoomable](https://user-images.githubusercontent.com/35371660/101857274-7a768980-3baa-11eb-8224-fce4011b4de4.gif)

* 기본값: `false`

zoomable을 통해 차트를 확대 할 수 있다.

```js
const options = {
  series: {
    zoomable: true
  }
}
```

### dataLabels

데이터 라벨은 차트에서 시리즈에 대한 값을 표시한다.
`dataLabels` 옵션은 다음과 같다.

```ts
type options = {
  ...
  series?: {
    dataLabels?: {
      visible?: boolean;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    }
  }
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `visible` | boolean | 데이터 라벨 표시 여부 |
| `offsetX` | number | 데이터 라벨 위치 x 오프셋 |
| `offsetY` | number | 데이터 라벨 위치 y 오프셋 |
| `formatter` | function | 데이터 값을 매개변수로 넘겨받아 출력 형식 지정 |

```js
// basic
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103474766-5fceb380-4dea-11eb-8c56-13bac3d68d8f.png)


## 시리즈 theme

Area 차트에서 수정할 수 있는 시리즈 테마이다. 데이터 라벨 테마는 화살표가 있는 말풍선 스타일을 사용할 수 있다.

```ts
interface AreaChartSeriesTheme {
  lineWidth?: number;
  areaOpacity?: number;
  dashSegments?: number[];
  colors?: string[];
  dot?: {
    radius?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  select?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
    areaOpacity?: number;
    restSeries?: {
      areaOpacity?: number;
    }
  };
  hover?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  dataLabels?: {
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
      arrow?: {
        visible?: boolean;
        width?: number;
        height?: number;
        direction?: 'top' | 'right' | 'bottom' | 'left';
      };
    };
  };
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `lineWidth` | number | 시리즈 라인 두께 |
| `areaOpacity` | number | 모든 시리즈가 활성 되어 있을 때의 전체 영역 투명도 |
| `dashSegments` | number[] | 시리즈 라인의 dashSegment 값 (IE11 이상 지원)  |
| `colors` | string[] | 시리즈의 색상 |
| `dot` | object | `showDot: true`일 때 노출되는 점 스타일 지정 |
| `select` | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| `select.dot` | object | 선택된 데이터를 나타내는 점 스타일 지정 |
| `select.areaOpacity` | number | 선택된 시리즈의 영역 투명도 |
| `select.restSeries` | object | 선택되지 않은 시리즈의 스타일 |
| `hover` | object | 데이터에 마우스를 올렸을 때 스타일 |
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
| `dataLabels.textBubble.arrow` | object | 말풍선 화살표 설정 |
| `dataLabels.textBubble.arrow.visible` | boolean | 화살표 표시 여부 |
| `dataLabels.textBubble.arrow.width` | number | 화살표 삼각형 너비 |
| `dataLabels.textBubble.arrow.height` | number | 화살표 삼각형 높이 |
| `dataLabels.textBubble.arrow.direction` | 'top' \| 'right' \| 'bottom' \| 'left' | 화살표 방향 |


테마는 options의 `theme`값으로 추가 해준다. 간단한 예시로 시리즈의 영역 투명도와 선의 두께를 바꿔보자.

```js
const options = {
  theme: {
    series: {
      areaOpacity: 0.8,
      lineWidth: 3,
    }
  }
};
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/101865447-a3eae180-3bb9-11eb-98da-9cbfdfc92bfb.png)

데이터 라벨의 테마를 적용하여 말풍선으로 바꾸고 글자 색상을 변경한 옵션은 아래와 같다.

```js
const options = {
  series: {
    dataLabels: { visible: true, offsetY: -10 }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        fontSize: 10,
        fontWeight: 300,
        useSeriesColor: true,
        textBubble: {
          visible: true,
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
};
```

![image](https://user-images.githubusercontent.com/43128697/103474846-221e5a80-4deb-11eb-9b0c-c2a7c2e1ea63.png)

