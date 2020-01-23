/**
 * @fileoverview Test for templateMaker
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import templateMaker from '../../src/js/helpers/templateMaker.js';

describe('Test for templateMaker', () => {
  describe('template()', () => {
    it('should make HTML using template', () => {
      const tag = '<a>{{ key1 }}<span>{{ key2 }}</span></a>{{ key1 }}';
      const template = templateMaker.template(tag);
      const result = template({ key1: 'ABC', key2: 'DEF' });
      expect(result).toBe('<a>ABC<span>DEF</span></a>ABC');
    });
  });
});
