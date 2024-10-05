import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { getColumnType } from '../../../shared/functions/get-column-data-type';
import {
  ColumnDataType,
  ColumnDataTypeEnum,
} from '../../../shared/types/column-data-type';

export type ReplaceTargetColumn = {
  headerKeys: string[];
  rowData: { [key: string]: string }[];
};

export type ReplaceColumnValue = {
  columnKey: string;
  target?: string[];
  rangeTarget?: { min: number; max: number };
  replace: string;
  replaceType: 'add' | 'replace';
  newColumnName: string | null;
};

type ResultValue = {};

@Component({
  selector: 'app-replace-column-value-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSelectModule,
    MatRadioModule,
    MatDividerModule,
    ScrollingModule,
  ],
  templateUrl: './replace-column-value-dialog.component.html',
  styleUrl: './replace-column-value-dialog.component.scss',
})
export class ReplaceColumnValueDialogComponent {
  readonly data = inject<ReplaceTargetColumn>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ReplaceColumnValueDialogComponent>);

  readonly ColumnDataTypeEnum = ColumnDataTypeEnum;

  headerKeys = this.data.headerKeys.filter((key) => key !== 'index-column');

  selectedColumn = signal<string | null>(null);
  selectedTarget = signal<string[]>([]);
  targetRangeMin = signal<number | null>(null);
  targetRangeMax = signal<number | null>(null);
  replaceValue = signal<string | null>(null);
  replaceType = signal<'add' | 'replace' | null>(null);
  newColumnName = signal<string | null>(null);

  targetValueOptions = computed<string[]>(() => {
    const selectedColumn = this.selectedColumn();

    if (selectedColumn === null) return [];

    const targetValues = new Set<string>();
    this.data.rowData.forEach((row) => {
      targetValues.add(row[selectedColumn]);
    });

    return Array.from(targetValues);
  });
  disableSubmit = computed<boolean>(
    () =>
      this.selectedColumn() === null ||
      this.selectedTarget() === null ||
      this.replaceType() === null ||
      (this.replaceType() === 'add' && this.newColumnName() === null)
  );
  targetColumnType = computed<ColumnDataType | null>(() => {
    const selectedColumn = this.selectedColumn();

    if (selectedColumn === null) return null;

    const targetValue = this.data.rowData.map((row) => row[selectedColumn]);
    return getColumnType(targetValue);
  });

  submit(): void {
    if (this.disableSubmit()) return;
    if (this.targetColumnType() === ColumnDataTypeEnum.NUMBER) {
      return this.dialogRef.close({
        columnKey: this.selectedColumn()!,
        rangeTarget: {
          min: this.targetRangeMin()!,
          max: this.targetRangeMax()!,
        },
        replace: this.replaceValue()!,
        replaceType: this.replaceType()!,
        newColumnName: this.newColumnName(),
      });
    }

    const value: ReplaceColumnValue = {
      columnKey: this.selectedColumn()!,
      target: this.selectedTarget()!,
      replace: this.replaceValue()!,
      replaceType: this.replaceType()!,
      newColumnName: this.newColumnName(),
    };

    return this.dialogRef.close(value);
  }
}
