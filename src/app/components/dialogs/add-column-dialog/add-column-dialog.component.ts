import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-column-dialog',
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
  ],
  templateUrl: './add-column-dialog.component.html',
  styleUrl: './add-column-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddColumnDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AddColumnDialogComponent>);
  columnName = signal('');

  cancel(): void {
    this.dialogRef.close();
  }
}
