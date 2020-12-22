# 차트 데이터 내보내기

모든 차트에 대해서 데이터를 이미지 파일(`.jpeg`, `.png`)과 `csv`, `xls` 파일로 내보낼 수 있다.

## options
데이터 내보내기 기능에 사용할 수 있는 옵션은 다음과 같다.

```ts
type options = {
  ...
  exportMenu?: {
    visible?: boolean;
    filename?: string;
  }
};
```

### visible
`exportMenu.filename` 옵션을 `false`로 설정하면 내보내기 메뉴 버튼이 차트에서 표시되지 않는다.

* 기본값: `true`

```js
const options = {
  exportMenu: {
    visible: false
  }
};
```

### filename

`exportMenu.filename` 옵션을 사용하면 내보낼 파일명을 지정할 수 있다. 만약 파일명을 지정해주지 않으면 차트의 제목(`chart.title`)이 기본으로 설정된다.

```js
const options = {
  exportMenu: {
    filename: 'custom_file_name'
  }
};
```
