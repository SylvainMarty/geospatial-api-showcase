export function asBoolean(value: string | boolean | null | undefined): boolean {
  if (typeof value === 'string') {
    switch ((value || '').toString().toLocaleLowerCase()) {
      case 'true':
        return true;
      case 'false':
        return false;
    }
  }

  return !!value;
}
