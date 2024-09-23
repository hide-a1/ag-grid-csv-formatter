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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

export type ReplaceTargetColumn = {
  headerKeys: string[];
  rowData: { [key: string]: string }[];
};

export type ReplaceColumnValue = {
  columnKey: string;
  target: string;
  replace: string;
  replaceType: 'add' | 'replace';
  newColumnName: string | null;
};

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
  ],
  templateUrl: './replace-column-value-dialog.component.html',
  styleUrl: './replace-column-value-dialog.component.scss',
})
export class ReplaceColumnValueDialogComponent {
  readonly data = inject<ReplaceTargetColumn>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ReplaceColumnValueDialogComponent>);

  headerKeys = this.data.headerKeys.filter((key) => key !== 'index-column');

  selectedColumn = signal<string | null>(null);
  selectedTarget = signal<string | null>(null);
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
      this.replaceValue() === null ||
      this.replaceType() === null ||
      (this.replaceType() === 'add' && this.newColumnName() === null)
  );

  submit(): void {
    if (this.disableSubmit()) return;

    const value: ReplaceColumnValue = {
      columnKey: this.selectedColumn()!,
      target: this.selectedTarget()!,
      replace: this.replaceValue()!,
      replaceType: this.replaceType()!,
      newColumnName: this.newColumnName(),
    };

    this.dialogRef.close(value);
  }
}
