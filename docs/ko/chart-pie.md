# Pie 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Pie 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { PieChart } from '@toast-ui/chart';

const chart = new PieChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.pieChart({el, data, options});
```

## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 시리즈는 `name`과 `data` 쌍으로 입력받는다.

```js
const data = {
  categories: ['Browser'],
  series: [
    {
      name: 'Chrome',
      data: 46.02,
    },
    {
      name: 'IE',
      data: 20.47,
    },
    {
      name: 'Firefox',
      data: 17.71,
    },
    {
      name: 'Safari',
      data: 5.45,
    },
    {
      name: 'Opera',
      data: 3.1,
    },
    {
      name: 'Etc',
      data: 7.25,
    }
  ]
}
```

![image](https://user-images.githubusercontent.com/43128697/102743434-cd1a2780-439a-11eb-8bda-0a2a8d142ad4.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

```js
const data = {
  categories: ['Browser'],
  series: [
    {
      name: 'Chrome',
      data: 46.02,
      visible: false
    },
    {
      name: 'IE',
      data: 20.47,
    },
    {
      name: 'Firefox',
      data: 17.71,
    },
    {
      name: 'Safari',
      data: 5.45,
    },
    {
      name: 'Opera',
      data: 3.1,
    },
    {
      name: 'Etc',
      data: 7.25,
    }
  ]
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108011697-fda0d980-704a-11eb-996e-b0b9670745b0.png)

## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
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
    // 아래 테마 챕터에서 설명
  }
  series?: {
    selectable?: boolean;
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
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      pieSeriesName?: {
        visible: boolean;
        anchor?: 'center' | 'outer';
      };
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

![image](https://user-images.githubusercontent.com/43128697/102746471-b4614000-43a1-11eb-925c-7622c72c611a.png)

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

![image](https://user-images.githubusercontent.com/43128697/102980458-ef52a780-454a-11eb-9998-22a92e2ed45e.gif)

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
      inner: '40%',
      outer: '100%',
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102746399-8976ec00-43a1-11eb-88f4-c86a5240e493.png)

값을 숫자 타입으로 입력하면 반지름은 절대값으로 계산된다.

```js
const options = {
  series: {
    radiusRange: {
      inner: 80,
      outer: 200,
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102746372-7e23c080-43a1-11eb-94a3-c483f1d03117.png)

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
      start: -90,
      end: 90,
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102748114-ec1db700-43a4-11eb-8f27-e0c881d55e00.png)

`clockwise`, `radiusRange`, `angleRange`를 활용하여 다양한 모양의 파이 차트를 표현할 수 있다.

```js
const options = {
  series: {
    clockwise: false,
    radiusRange: {
      inner: '70%',
      outer: '90%',
    },
    angleRange: {
      start: 135,
      end: 225,
    },
  },
};
```

![image](https://user-images.githubusercontent.com/43128697/102748528-af9e8b00-43a5-11eb-865d-1ba8ce15256a.png)

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
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
      pieSeriesName?: {
        visible: boolean;
        anchor?: 'center' | 'outer';
      };
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
| `anchor` | 'center' \| 'outer' | 데이터 라벨 표시 위치 설정. `'center'`는 원 안에, `'outer'`는 원 바깥에 라벨이 위치.<br>(기본값: `'center'`) |
| `pieSeriesName` | object | 시리즈 이름 라벨 표시 설정 |
| `pieSeriesName.visible` | boolean | 시리즈 이름 라벨 표시 여부 |
| `pieSeriesName.anchor` | 'center' \| 'outer' | 시리즈 이름 라벨 표시 위치 설정. `'center'`는 원 안에, `'outer'`는 원 바깥에 라벨이 위치.<br>(기본값: `'center'`) |

```js
// 기본
const options = {
  series: {
    dataLabels: { visible: true }
  }
};
```

```js
// outer anchor 적용
const options = {
  series: {
    dataLabels: {
      visible: true,
      anchor: 'outer'
    }
  }
};
```

| 기본 | outer anchor 적용 |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/103474427-13ce3f80-4de7-11eb-97f6-58ab2cd29001.png) | ![image](https://user-images.githubusercontent.com/43128697/103474431-15980300-4de7-11eb-9664-e96e7e763422.png) |

```js
// 기본 - 시리즈 이름 라벨 표시
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: { visible: true }
    }
  }
};
```

```js
// 시리즈 이름 라벨 위치 outer anchor 적용
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: {
        visible: true,
        anchor: 'outer'
      }
    }
  }
};
```

| 기본 - 시리즈 이름 라벨 표시 | 시리즈 이름 라벨 위치 outer anchor 적용 |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/103474482-b38bcd80-4de7-11eb-99ac-54842fe29b0d.png) | ![image](https://user-images.githubusercontent.com/43128697/103474483-b5ee2780-4de7-11eb-812a-045f78f71e8f.png) |


## 시리즈 theme

Pie 차트에서 수정할 수 있는 시리즈 테마이다. 데이터 라벨 스타일은 값을 나타내는 기본 라벨을 포함하여, 시리즈 이름을 나타내는 라벨, callout 라인 스타일을 설정할 수 있다. 화살표가 없는 말풍선 스타일을 사용할 수 있다.

```ts
interface PieChartSeriesTheme {
  colors?: string[];
  areaOpacity?: number;
  lineWidth?: number;
  strokeStyle?: string;
  hover?: {
    color?: string;
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  select?: {
    color?: string;
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  };
  dataLabels?: CommonDataLabelBoxTheme & {
    pieSeriesName?: CommonDataLabelBoxTheme;
    callout?: {
      useSeriesColor?: boolean;
      lineWidth?: number;
      lineColor?: string;
    };
  };
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
| `areaOpacity` | number | 모든 시리즈가 활성 되어 있을 때의 전체 영역 투명도 |
| `lineWidth` | number | 시리즈의 테두리 선 너비 |
| `strokeStyle` | string | 시리즈의 테두리 선 색 |
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
| `dataLabels.pieSeriesName` | object | 시리즈 이름을 나타내는 라벨 스타일. `dataLabels`에 적용할 수 있는 스타일 옵션 모두 사용 가능 |
| `dataLabels.callout` | object | 원과 원 밖에 있는 라벨을 잇는 callout 라인 스타일을 설정 |
| `dataLabels.callout.useSeriesColor` | boolean | callout 라인 색상을 시리즈 색상을 사용할지 여부 |
| `dataLabels.callout.lineWidth` | number | callout 라인 두께 |
| `dataLabels.callout.lineColor` | string | callout 라인 색상. `callout.useSeriesColor: true`이면 동작하지 않음 |

테마는 옵션에서 `theme` 옵션을 지정하고 시리즈 테마는 `theme.series`로 설정한다. 간단한 예시로 시리즈의 색상과 테두리 스타일을 변경해보자.

```js
const options = {
  theme: {
    series: {
      colors: ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'],
      lineWidth: 2,
      strokeStyle: '#000000',
    }
  }
}
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/43128697/102745724-fab59f80-439f-11eb-892c-1ece9aa9845f.png)

아래 코드는 데이터 라벨 테마를 적용하여 글자 스타일, callout 라인 및 시리즈 이름 라벨의 스타일을 변경한 옵션이다.

```js
const options = {
  series: {
    dataLabels: {
      visible: true,
      pieSeriesName: { visible: true, anchor: 'outer' }
    }
  },
  theme: {
    series: {
      dataLabels: {
        fontFamily: 'monaco',
        useSeriesColor: true,
        lineWidth: 2,
        textStrokeColor: '#ffffff',
        shadowColor: '#ffffff',
        shadowBlur: 4,
        callout: {
          lineWidth: 3,
          lineColor: '#f44336',
          useSeriesColor: false
        },
        pieSeriesName: {
          useSeriesColor: false,
          color: '#f44336',
          fontFamily: 'fantasy',
          fontSize: 13,
          textBubble: {
            visible: true,
            paddingX: 1,
            paddingY: 1,
            backgroundColor: 'rgba(158, 158, 158, 0.3)',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)'
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102973846-db09ad00-4540-11eb-9f9e-36186740d3b4.png)
