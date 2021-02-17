# NestedPie 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

NestedPie 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { NestedPieChart } from '@toast-ui/chart';

const chart = new NestedPieChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.nestedPieChart({el, data, options});
```

## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 중첩된 파이 차트는 별칭이 되는 `name`값을 입력받고, `data`에 섹터를 표현할 수 있는 데이터를 `name`, `data` 쌍으로 입력받는다. 입력한 모든 `data` 값이 범례에 표시된다.

```js
const data = {
  series: [
    {
      name: 'browsers',
      data: [
        {
          name: 'Chrome',
          data: 50,
        },
        {
          name: 'Safari',
          data: 20,
        },
        {
          name: 'IE',
          data: 10,
        },
        {
          name: 'Firefox',
          data: 10,
        },
        {
          name: 'Opera',
          data: 3,
        },
        {
          name: 'Etc',
          data: 7,
        },
      ],
    },
    {
      name: 'versions',
      data: [
        {
          name: 'Chrome 64',
          data: 40,
        },
        {
          name: 'Chrome 63',
          data: 10,
        },
        {
          name: 'Safari 13',
          data: 15,
        },
        {
          name: 'Safari 12',
          data: 5,
        },
        {
          name: 'IE 11',
          data: 4,
        },
        {
          name: 'IE 10',
          data: 3,
        },
        {
          name: 'IE 9',
          data: 2,
        },
        {
          name: 'IE 8',
          data: 1,
        },
        {
          name: 'Firefox 13',
          data: 8,
        },
        {
          name: 'Firefox 12',
          data: 2,
        },
        {
          name: 'Opera 15',
          data: 2,
        },
        {
          name: 'Opera 12',
          data: 1,
        },
        {
          name: 'Etc - 2020',
          data: 7,
        },
      ],
    },
  ]
}
```

![image](https://user-images.githubusercontent.com/43128697/102752476-0065b200-43ad-11eb-99dd-eee963788d97.png)

### 그룹 데이터

`parentName`을 지정하면 데이터의 부모 시리즈를 설정해주어 그룹 데이터로 표현한다. 그룹 데이터는 시리즈의 색깔이 같으며 투명도로 구분된다. `series`의 첫번째 인덱스에 있는 `data` 값만 범례로 표시한다.

```js
const data = {
  categories: ['A', 'B'],
  series: [
    {
      name: 'browsers',
      data: [
        {
          name: 'Chrome',
          data: 50,
        },
        {
          name: 'Safari',
          data: 20,
        },
        {
          name: 'IE',
          data: 10,
        },
        {
          name: 'Firefox',
          data: 10,
        },
        {
          name: 'Opera',
          data: 3,
        },
        {
          name: 'Etc',
          data: 7,
        },
      ],
    },
    {
      name: 'versions',
      data: [
        {
          name: 'Chrome 64',
          parentName: 'Chrome',
          data: 40,
        },
        {
          name: 'Chrome 63',
          parentName: 'Chrome',
          data: 10,
        },
        {
          name: 'Safari 13',
          parentName: 'Safari',
          data: 15,
        },
        {
          name: 'Safari 12',
          parentName: 'Safari',
          data: 5,
        },
        {
          name: 'IE 11',
          parentName: 'IE',
          data: 4,
        },
        {
          name: 'IE 10',
          parentName: 'IE',
          data: 3,
        },
        {
          name: 'IE 9',
          parentName: 'IE',
          data: 2,
        },
        {
          name: 'IE 8',
          parentName: 'IE',
          data: 1,
        },
        {
          name: 'Firefox 13',
          parentName: 'Firefox',
          data: 8,
        },
        {
          name: 'Firefox 12',
          parentName: 'Firefox',
          data: 2,
        },
        {
          name: 'Opera 15',
          parentName: 'Opera',
          data: 2,
        },
        {
          name: 'Opera 12',
          parentName: 'Opera',
          data: 1,
        },
        {
          name: 'Etc 1',
          parentName: 'Etc',
          data: 3,
        },
        {
          name: 'Etc 2',
          parentName: 'Etc',
          data: 2,
        },
        {
          name: 'Etc 3',
          parentName: 'Etc',
          data: 1,
        },
        {
          name: 'Etc 4',
          parentName: 'Etc',
          data: 1,
        },
      ],
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/43128697/102752512-0c517400-43ad-11eb-96f7-614d0cd9bd6c.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.
기본 차트와 그룹 데이터 차트의 사용법은 동일하다.

```js
const data = {
  series: [
    {
      name: 'browsers',
      data: [
        {
          name: 'Chrome',
          data: 50,
          visible: false,
        },
        {
          name: 'Safari',
          data: 20,
        },
        {
          name: 'IE',
          data: 10,
        },
        {
          name: 'Firefox',
          data: 10,
          visible: false,
        },
        {
          name: 'Opera',
          data: 3,
        },
        {
          name: 'Etc',
          data: 7,
        },
      ],
    },
    {
      name: 'versions',
      data: [
        {
          name: 'Chrome 64',
          data: 40,
        },
        {
          name: 'Chrome 63',
          data: 10,
        },
        {
          name: 'Safari 13',
          data: 15,
        },
        {
          name: 'Safari 12',
          data: 5,
        },
        {
          name: 'IE 11',
          data: 4,
        },
        {
          name: 'IE 10',
          data: 3,
        },
        {
          name: 'IE 9',
          data: 2,
        },
        {
          name: 'IE 8',
          data: 1,
        },
        {
          name: 'Firefox 13',
          data: 8,
        },
        {
          name: 'Firefox 12',
          data: 2,
        },
        {
          name: 'Opera 15',
          data: 2,
        },
        {
          name: 'Opera 12',
          data: 1,
        },
        {
          name: 'Etc - 2020',
          data: 7,
        },
      ],
    },
  ]
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108011512-9125da80-704a-11eb-8b45-8fc01777e14e.png)


## 옵션

`options`는 객체로 작성한다. `series` 옵션은 기본적으로 [Pie 차트의 시리즈 옵션](./chart-pie.md)과 같고 `radiusRange`는 각 시리즈의 반지름 범위를 설정하기 위해 `[name]` 옵션으로 이동했다. `[name]`은 입력받은 데이터에서 series의 `name`이 이에 해당한다. 중첩된 모든 시리즈에 공통으로 적용할 옵션은 `series`에 바로 작성하고, 각 시리즈별로 적용할 옵션은 `[name]`에 작성한다.

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
    [name]: {
      selectable?: boolean;
      clockwise?: boolean;
      angleRange?: {
        start?: number;
        end?: number;
      };
      radiusRange?: {
        inner?: number | string;
        outer?: number | string;
      };
      dataLabels?: {
        visible?: boolean;
        anchor?: DataLabelAnchor;
        offsetX?: number;
        offsetY?: number;
        formatter?: (value) => string;;
        pieSeriesName?: {
          visible: boolean;
          anchor?: 'center' | 'outer';
        };
      };
    }
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

각 시리즈 `name`에 해당하는 옵션을 설정할 수 있다. 아래와 같이 작성하면, `'browsers'`에 해당하는 Pie 차트는 선택할 수 있고, `versions`에 해당하는 Pie 차트는 선택할 수 없다.

```js
const options = {
  series: {
    browsers: {
      selectable: true
    },
    versions: {
      selectable: false
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102752626-2ab76f80-43ad-11eb-8bf5-913370a63c40.png)


그룹 데이터를 선택하면 `parentName`으로 연결된 모든 시리즈를 선택한다.

![image](https://user-images.githubusercontent.com/43128697/102752680-4589e400-43ad-11eb-8c5f-84104e489416.png)


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

![image](https://user-images.githubusercontent.com/43128697/102986094-99cec880-4553-11eb-9210-92ffa2f2951d.gif)

각 시리즈 `name`에 해당하는 옵션을 설정할 수 있다. 아래와 같이 작성하면, `'browsers'`에 해당하는 Pie 차트는 시계 방향으로 그려지고, `versions`에 해당하는 Pie 차트는 시계 반대 방향으로 그려진다.

```js
const options = {
  series: {
    browsers: {
      clockwise: true
    },
    versions: {
      clockwise: false
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102756849-cfd54680-43b3-11eb-9e37-af21fa40ef72.png)

### radiusRange

`radiusRange`는 `inner`와 `outer` 옵션을 지정하여 안쪽 원의 반지름과 바깥쪽 원의 반지름을 설정한다. `inner`의 기본값은 `0`이다. 0보다 큰 값을 입력하면 도넛 모양의 차트를 만들 수 있다. 각 시리즈 `name`에 해당하는 옵션을 설정할 수 있다. 만약 `series.radiusRange`를 설정하지 않는다면 각 중첩된 시리즈가 균일한 반지름을 갖도록 설정된다.

| 속성 | 설명 |
| --- | --- |
| `radiusRange.inner` | 안쪽의 반지름 설정 |
| `radiusRange.outer` | 바깥쪽의 반지름 설정 |

값을 `%`를 포함한 문자열 타입으로 입력하면 비율로 계산한다.

```js
const options = {
  series: {
    browsers: {
      radiusRange: {
        inner: '20%',
        outer: '50%'
      }
    },
    versions: {
      radiusRange: {
        inner: '55%',
        outer: '85%'
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102768135-fd29f080-43c3-11eb-8a63-d805d8ee5467.png)

값을 숫자 타입으로 입력하면 반지름은 절대값으로 계산된다.

```js
const options = {
  series: {
    browsers: {
      radiusRange: {
        inner: 50,
        outer: 130
      },
    },
    versions: {
      radiusRange: {
        inner: 150,
        outer: 230
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102768172-1468de00-43c4-11eb-97b3-182643c0d672.png)

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
      end: 90
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102768300-48dc9a00-43c4-11eb-8208-61b96de1f0fc.png)

각 시리즈 `name`에 해당하는 옵션을 설정할 수 있다.

```js
const options = {
  series: {
    browsers: {
      angleRange: {
        start: 0,
        end: 180
      }
    },
    versions: {
      angleRange: {
        start: 180,
        end: 360
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102768425-7e818300-43c4-11eb-8b34-2c9f87f08602.png)

### dataLabels

`series.dataLabels` 옵션을 지정하면 모든 중첩된 Pie 차트에서 데이터 라벨이 표시할 수 있다.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478578-02972a00-4e0b-11eb-9aa9-b9e66ce48279.png)

`series` 옵션에 각 계층별로 Pie 시리즈 옵션을 정의할 수 있으며, 데이터 라벨 관련 옵션도 좀 더 세밀하게 설정할 수 있다.

```ts
type options = {
  ...
  series?: {
    [name]: {
      ...
      dataLabels: {
        // Pie 시리즈  데이터 라벨 옵션
      };
    },
    ...
  };
};
```

아래 코드는 안쪽에 있는 Pie 시리즈('browsers')에는 데이터 라벨만 표시하고, 바깥쪽에 있는 Pie 시리즈('versions')에는 시리즈 이름 라벨까지 표시하도록 설정한 옵션이다.

```js
const options = {
  series: {
    browsers: {
      radiusRange: {
        inner: '20%',
        outer: '50%'
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: false
        }
      }
    },
    versions: {
      radiusRange: {
        inner: '55%',
        outer: '85%'
      },
      dataLabels: {
        visible: true,
        pieSeriesName: {
          visible: true,
          anchor: 'outer'
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478580-0460ed80-4e0b-11eb-97d6-f7998a9029dd.png)

## 시리즈 theme

NestedPie 차트에서 각 시리즈별로 수정할 수 있는 시리즈 테마이다. 각 Pie 시리즈의 데이터 라벨 스타일을 지정할 경우 `series[name].dataLabels`를 정의한다.

```ts
interface NestedPieChartSeriesTheme {
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
| `dataLabels` | object | 데이터 라벨 스타일. Pie 차트의 [`theme.dataLabels` 옵션](./chart-pie.md)과 같다. |

테마는 옵션에서 `theme` 옵션을 지정하고 시리즈 테마는 `theme.series`로 설정한다. 간단한 예시로 시리즈의 스타일을 바꿔보자.

아래 코드는 `lineWidth`, `strokeStyle`을 설정하여 중첩된 모든 시리즈의 선 두께와 색깔을 변경한 옵션이다.

```js
const options = {
  theme: {
    series: {
      colors: ['#eef4c4', '#77543f', '#b7c72e', '#5b9aa0', '#30076f', '#622569', '#f75294'],
      lineWidth: 5,
      strokeStyle: '#cccccc',
    }
  }
}
```

![image](https://user-images.githubusercontent.com/43128697/102754882-f940a300-43b0-11eb-8644-73f3effa39df.png)

`[name]`에 해당하는 각 시리즈별로 스타일을 적용할 수 있다. 아래 코드는 시리즈 색상, 테두리 두께, 테두리 색상과 마우스를 올렸을 때 스타일을 변경한 옵션이다.

```js
const options = {
  theme: {
    series: {
      browsers: {
        colors: ['#eef4c4', '#77543f', '#b7c72e', '#5b9aa0', '#30076f', '#622569'],
        lineWidth: 5,
        strokeStyle: '#0000ff',
        hover: {
          color: '#0000ff',
          lineWidth: 5,
          strokeStyle: '#000000',
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 10
        },
      },
      versions: {
        colors: [
          '#cddbda',
          '#efd1d1',
          '#ea005e',
          '#fece2f',
          '#fc6104',
          '#dd2429',
          '#ebc7ff',
          '#fece2f',
          '#dd2429',
          '#ff8d3a',
          '#fc6104',
          '#5ac18e',
          '#8570ff'
        ],
        lineWidth: 2,
        strokeStyle: '#ff0000',
        hover: {
          color: '#ff0000',
          lineWidth: 2,
          strokeStyle: '#000000',
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 10
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102755523-e5e20780-43b1-11eb-96a5-10e494e37d27.png)

`[name]`에 해당하는 각 시리즈별로 라벨 스타일을 적용할 수 있다. 아래 코드는 글자 스타일과 말풍선을 사용하여 테마를 적용한 옵션이다.

```js
const options = {
  series: {
    browsers: {
      dataLabels: {
        visible: true
      }
    },
    versions: {
      dataLabels: {
        visible: true,
        pieSeriesName: { visible: true, anchor: 'outer' }
      }
    }
  },
  theme: {
    series: {
      browsers: {
        dataLabels: {
          fontFamily: 'fantasy',
          fontSize: 13,
          useSeriesColor: true,
          textBubble: {
            visible: true,
            backgroundColor: '#333333',
            borderRadius: 5,
            borderColor: '#ff0000',
            borderWidth: 3,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)',
          },
        },
      },
      versions: {
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
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103478668-9cf76d80-4e0b-11eb-84fc-fce9f8412d2f.png)
