import {
  observable,
  observe,
  notify,
  computed,
  watch,
  setValue,
  extend,
  invisibleWork,
} from '@src/store/reactive';

describe('observable/observe', () => {
  it('should invoke observer when dependency changed', () => {
    const target = observable({
      data1: 'da',
      data2: 'ta',
    });

    let total = '';

    observe(() => {
      total = target.data1 + target.data2;
    });

    target.data2 = 'ba';

    expect(total).toEqual('daba');
  });

  it('should invoke nested observer after current invoking', () => {
    const target = observable({
      data1: 0,
      data2: 0,
    });

    observe(() => {
      target.data1 += 1; // add data1 deps to cue
      target.data1 += 1; // replace cue(cue should'nt have same dep more than one)
    });

    observe(() => {
      target.data2 = target.data1 + target.data2;
    });

    target.data1 = 3;

    expect(target.data2).toEqual(12);
    // not 7, cuz target.data1 = 3; trigger second observe purely(not nested)
  });

  it('should not invoke observer if data value have not changed', () => {
    const target = observable({
      data: 1,
    });

    observe(() => {
      target.data += 1;
    });

    target.data = 2;

    expect(target.data).toEqual(2);
  });

  it('should manage data dependency separately', () => {
    const target = observable({
      data1: 0,
      data2: 0,
    });

    let data1Count = 0;
    let data2Count = 0;

    observe(() => {
      data1Count += target.data1;
    });

    observe(() => {
      data2Count += target.data2;
    });

    target.data1 = 1;
    target.data2 = 2;

    expect(data1Count).toEqual(1);
    expect(data2Count).toEqual(2);
  });

  it('should not collect observe dependency redundantly', () => {
    const target = observable({
      data: 0,
    });

    let referenceCount = 0;

    observe(() => {
      referenceCount += target.data;
      referenceCount += target.data;
    });

    target.data = 1;

    expect(referenceCount).toEqual(2);
  });

  it('should ensure predefined getter/setter', () => {
    const target = observable({
      _data: 5,
      set data(v) {
        this._data = v;
      },
      get data() {
        return this._data + 1;
      },
    });

    let obData = 0;

    observe(() => {
      obData = target.data;
    });

    target.data += 1;

    expect(target.data).toEqual(8);
    expect(obData).toEqual(8);
  });

  it('could remove useless observer', () => {
    const target = observable({
      data: 0,
    });

    const target2 = observable({
      data: 1,
    });

    let referenceCount = 0;

    const unob = observe(() => {
      referenceCount += target.data;
      referenceCount += target2.data;
    });

    target.data = 1;

    unob();

    target.data = 2;
    target2.data = 2;

    expect(referenceCount).toEqual(3);
  });

  it('should make observable for object recursively', () => {
    const target = observable({
      data: {
        rData: 1,
      },
    });

    let sum = 0;

    observe(() => {
      sum += target.data.rData;
    });

    target.data.rData = 2;

    expect(sum).toEqual(3);
  });

  it('should not make observable for array recursively', () => {
    const target = observable({
      data: [{ rData: 1 }],
    });

    let sum = 0;

    observe(() => {
      sum += target.data[0].rData;
    });

    target.data[0].rData = 2;

    expect(sum).toEqual(1);
  });
});

describe('setValue', () => {
  it('should setValue observable object to existing observable object', () => {
    const target = observable({
      data: {
        rData: 0,
      },
    });

    setValue(target, 'data2', { rData: 0 });

    let sum = 0;

    observe(() => {
      sum += target.data.rData;
      sum += target.data2.rData;
    });

    target.data.rData = 1; // 1
    target.data2.rData = 1; // 3

    expect(sum).toEqual(3);
  });

  it('should setValue observable data to existing observable object', () => {
    const target = observable({
      data: {
        rData: 0,
      },
    });

    setValue(target.data, 'rData2', 0);

    let sum = 0;

    observe(() => {
      sum += target.data.rData;
      sum += target.data.rData2;
    });

    target.data.rData = 1; // 1
    target.data.rData2 = 1; // 3

    expect(sum).toEqual(3);
  });

  // Do we realy need this? 필요할때 구현, ob가 클로저에서 나와야 한다.
  it.skip('should notify observer when new observable property has been added', () => {
    const target: Record<string, any> = observable({
      data: {
        rData: 1,
      },
    });

    let sum = 0;

    observe(() => {
      sum += target.data.rData;
    });

    setValue(target.data, 'rData2', 0);

    expect(sum).toEqual(2);
  });
});

describe('extend', () => {
  it('should extend observable object with new object', () => {
    const target: Record<string, any> = observable({
      data: {
        rData: 0,
      },
    });

    extend(target, {
      data2: {
        rData: 0,
      },
    });

    let sum = 0;

    observe(() => {
      sum += target.data.rData;
      sum += target.data2.rData;
    });

    target.data.rData = 1; // 1
    target.data2.rData = 1; // 3

    expect(sum).toEqual(3);
  });
});

describe('notify', () => {
  it('should invoke observers', () => {
    const target = observable({
      data: 5,
    });

    observe(() => {
      target.data += 1;
    });

    notify(target, 'data');
    notify(target, 'data');

    expect(target.data).toEqual(8);
  });
});

describe('computed', () => {
  it('should make new value when dependency have changed', () => {
    const target: Record<string, any> = {};

    const dep = observable({
      data: 5,
    });

    computed(target, 'myComputed', () => {
      return dep.data + 5;
    });

    dep.data = 10;

    expect(target.myComputed).toEqual(15);
  });

  it('should be observable', () => {
    const target: Record<string, any> = {};

    const dep = observable({
      data: 1,
    });

    computed(target, 'myComputed', () => {
      return dep.data + 1;
    });

    let expectValue = 0;

    observe(() => {
      expectValue = target.myComputed;
    });

    dep.data = 2;

    expect(expectValue).toEqual(3);
  });
  describe('watch', () => {
    it('should invoke function when watch data changed', () => {
      const dep = observable({
        data: 5,
      });

      const watcherFn = jest.fn();

      watch(dep, 'data', watcherFn);

      dep.data = 6;

      expect(watcherFn.mock.calls.length).toEqual(1);
    });

    it('could unwatch', () => {
      const dep = observable({
        data: 1,
      });

      const watcherFn = jest.fn();

      const unwatch = watch(dep, 'data', watcherFn);

      dep.data = 2;

      if (unwatch) {
        unwatch();
      }

      dep.data = 3;

      expect(watcherFn.mock.calls.length).toEqual(1);
    });
  });

  describe('invisibleWork', () => {
    it('should invoke function avoid collect depecdency even in observe', () => {
      const target = observable({
        data1: 'da',
        data2: 'ta',
      });

      let total = '';

      observe(() => {
        invisibleWork(() => {
          total = target.data1 + target.data2;
        });
      });

      target.data2 = 'ba';

      expect(total).toEqual('data');
    });

    it('should invoke nested observer after invisible work', () => {
      const target = observable({
        data1: 1,
        data2: 2,
      });

      const v: number[] = [];

      observe(() => {
        v.push(target.data1);
      });

      observe(() => {
        v.push(target.data2);
      });

      invisibleWork(() => {
        target.data2 = 5;
        v.push(3);
      });

      expect(v).toEqual([1, 2, 3, 5]);
    });
  });
});
