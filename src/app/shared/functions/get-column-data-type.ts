import { ColumnDataType } from '../types/column-data-type';

export function getColumnType(columnData: any[]): ColumnDataType {
  const types: ColumnDataType[] = columnData.map((data) => {
    if (data instanceof Date) {
      return 'date';
    }
    if (typeof data === 'number') {
      return 'number';
    }
    if (typeof data === 'boolean') {
      return 'boolean';
    }
    return 'string';
  });
  const uniqueTypes = Array.from(new Set(types));
  return uniqueTypes.length === 1 ? uniqueTypes[0] : 'string';
}
