import { formatDate } from '@src/helpers/formatDate';

it('formatDate', () => {
  expect(formatDate('YYYY-MM', new Date('2020-02-02'))).toBe('2020-02');
  expect(formatDate('yy', new Date('2020-02-02'))).toBe('20');
  expect(
    formatDate('MMM DD YYYY HH:mm', {
      year: 2020,
      month: 2,
      date: 3,
      hour: 4,
      minute: 5,
      second: 6,
    })
  ).toBe('Feb 03 2020 04:05');
  expect(formatDate('YYYY-MM-DD HH:mm:ss', new Date('2020-03-04 05:06'))).toBe(
    '2020-03-04 05:06:00'
  );
  expect(formatDate('YYYY-MM-DD HH:mm:ss', new Date('2020-03-04T00:00'))).toBe(
    '2020-03-04 00:00:00'
  );
});
