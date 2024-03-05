import { asBoolean } from '@/shared/helpers/type.helper';

describe('asBoolean', () => {
  test.concurrent.each([
    { input: true, expectedOutput: true },
    { input: 'true', expectedOutput: true },
    { input: false, expectedOutput: false },
    { input: 'false', expectedOutput: false },
    { input: null, expectedOutput: false },
    { input: undefined, expectedOutput: false },
  ])(
    'return $expectOutput when input equals $input',
    ({ input, expectedOutput }) => {
      expect(asBoolean(input)).toEqual(expectedOutput);
    },
  );
});
