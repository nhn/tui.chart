import RaphaelTitleComponent from '../../src/js/plugins/raphaelTitleComponent';

describe('RaphaelTitleComponent', () => {
  const raphaelTitleComponent = new RaphaelTitleComponent();

  describe('getTitlePosition() ', () => {
    it('position should have a value with the align center state applied.', () => {
      const offset = { x: 0, y: 0 };
      const titleSize = {
        width: 40,
        height: 10
      };
      const actual = raphaelTitleComponent.getTitlePosition(titleSize, 'center', 300, offset).left;

      expect(actual).toBe(150);
    });

    it('position should have a value with the align right state applied.', () => {
      const offset = { x: 0, y: 0 };
      const titleSize = {
        width: 40,
        height: 10
      };
      const actual = raphaelTitleComponent.getTitlePosition(titleSize, 'right', 300, offset).left;

      expect(actual).toBe(300);
    });

    it('position should have a value with the align left state applied.', () => {
      const offset = { x: 0, y: 0 };
      const titleSize = {
        width: 40,
        height: 10
      };
      const actual = raphaelTitleComponent.getTitlePosition(titleSize, 'left', 300, offset).left;

      expect(actual).toBe(10);
    });
  });
});
