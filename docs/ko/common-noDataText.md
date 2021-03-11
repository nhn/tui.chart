# No Data 텍스트

No Data 텍스트는 데이터가 존재하지 않을 때 "No data to display" 같은 텍스트를 보여주는 옵션이다.

![image](https://user-images.githubusercontent.com/35371660/110044680-e53ff700-7d8c-11eb-9cd3-6640296b4211.png)

## 텍스트 변경

기본 텍스트 값은 "No data to display"이다. 다국어 처리 또는 문구를 변경하고 싶은 경우 `options.lang.noData`를 사용한다.

```js
const options = {
  lang: {
    noData: '😭No Data!!😭',
  },
};
```

결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/110045554-30a6d500-7d8e-11eb-8e64-9b1b9d91ca58.png)

## theme

현재 제공되고 있는 No Data 텍스트 테마 옵션은 다음과 같다.

```ts
interface NoDataTheme {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
}
```

| 이름       | 타입   | 설명              |
| ---------- | ------ | ----------------- |
| fontSize   | string | 폰트 크기         |
| fontFamily | string | 폰트 종류         |
| fontWeight | number \| string | 폰트 가중치, 굵기 |
| color      | string | 색상              |

간단한 예시로 텍스트의 색상을 변경해보겠습니다.

```js
const options = {
  theme: {
    noData: {
      fontSize: 30,
      fontFamily: 'Verdana',
      fontWeight: 'bold',
      color: '#3ee',
    },
  },
};
```

해당 옵션을 적용한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/110046386-42d54300-7d8f-11eb-9afd-148dd6738abd.png)
