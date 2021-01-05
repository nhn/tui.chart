import { rgba, getAlpha, getRGBA, rgbToHEX, hexToRGB } from '@src/helpers/color';

it('hexToRGB() returns the converted rgb value array', () => {
  expect(hexToRGB('black')).toEqual([0, 0, 0]);
  expect(hexToRGB('#000000')).toEqual([0, 0, 0]);
  expect(hexToRGB('#000')).toEqual([0, 0, 0]);
});

it('rgbToHex() returns the converted hex value', () => {
  expect(rgbToHEX(0, 255, 128)).toEqual('#00ff80');
  expect(rgbToHEX(270, 270, 270)).toEqual(false);
});

it('getRGBA() returns the rgba value reflecting the transparency', () => {
  expect(getRGBA('#000', 0.4)).toEqual('rgba(0, 0, 0, 0.4)');
  expect(getRGBA('#000000', 0.4)).toEqual('rgba(0, 0, 0, 0.4)');
  expect(getRGBA('black', 0.4)).toEqual('rgba(0, 0, 0, 0.4)');
  expect(getRGBA('rgb(0, 0, 0)', 0.4)).toEqual('rgba(0, 0, 0, 0.4)');
  expect(getRGBA('rgba(0, 0, 0, 0.3)', 0.4)).toEqual('rgba(0, 0, 0, 0.4)');
});

it('getAlpha() returns the opacity', () => {
  expect(getAlpha('#000')).toEqual(1);
  expect(getAlpha('#000000')).toEqual(1);
  expect(getAlpha('black')).toEqual(1);
  expect(getAlpha('rgb(0, 0, 0)')).toEqual(1);
  expect(getAlpha('rgba(0, 0, 0, 0.3)')).toEqual(0.3);
});

describe('rgba', () => {
  it('should return the value applied opacity in rgb', () => {
    expect(rgba('#000000', 0.3)).toEqual('rgba(0, 0, 0, 0.3)');
  });

  it('If opacity exists, it is reflected by multiplying the existing transparency by the additional transparency.', () => {
    expect(rgba('rgba(0, 0, 0, 0.5)', 0.5)).toEqual('rgba(0, 0, 0, 0.25)');
  });
});
