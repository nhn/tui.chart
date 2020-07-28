import { formatDate } from '@src/helpers/formatDate';

it('formatDate', () => {
  expect(formatDate('YYYY-MM', new Date('2020-02-02'))).toBe('2020-02');
  expect(formatDate('yy', new Date('2020-02-02'))).toBe('20');

  expect(
    formatDate('MMM DD YYYY HH:mm', { year: 2020, month: 2, date: 3, hour: 4, minute: 5 })
  ).toBe('Feb 03 2020 04:05');
});
