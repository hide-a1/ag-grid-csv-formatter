import { AG_GRID_LOCALE_JP } from '@ag-grid-community/locale';
import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowSelectedEvent,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
} from 'ag-grid-community';
import * as XLSX from 'xlsx';
import { AddColumnDialogComponent } from './components/dialogs/add-column-dialog/add-column-dialog.component';
import {
  ReplaceColumnValue,
  ReplaceColumnValueDialogComponent,
} from './components/dialogs/replace-column-value-dialog/replace-column-value-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AgGridAngular,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    DecimalPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private gridApi!: GridApi;
  private readonly dialog = inject(MatDialog);

  themeClass = 'ag-theme-quartz';
  // Row Data: The data to be displayed.
  rowData: { [key: string]: string }[] = [];
  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    editable: true,
    filter: 'agTextColumnFilter',
    suppressHeaderMenuButton: true,
    suppressHeaderContextMenu: true,
    filterParams: {
      buttons: ['reset'],
    },
  };
  autoSizeStrategy:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 100,
  };
  rowSelection: 'single' | 'multiple' = 'multiple';
  localText = {
    ...AG_GRID_LOCALE_JP,
    noRowsToShow: 'データがありません、CSVファイルをインポートしてください。',
  };
  duplicateValueMap = new Map<string, string[]>();

  rowSelected = signal<boolean>(false);
  count = signal<number>(0);
  displayCount = signal<number>(0);

  // Import CSV file
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const bstr = reader.result;
      const workBook = XLSX.read(bstr, { type: 'binary', cellDates: true });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const fileData = XLSX.utils.sheet_to_json(workSheet, {
        header: 1,
      }) as string[][];

      const headers = fileData[0];
      const rows = fileData.slice(1);

      this.colDefs = headers.map((header, i) => ({
        field: header,
        cellEditor: 'agTextCellEditor',
        filterParams: {
          filterOptions: [
            'empty',
            'contains',
            'notContains',
            'startsWith',
            'endsWith',
            'equals',
            'notEqual',
            'blank',
            'notBlank',
            {
              displayKey: 'duplicated' + i,
              displayName: '重複',
              predicate: ([filterValue]: [string], cellValue: string) => {
                return (
                  this.duplicateValueMap.get(header)?.includes(cellValue) ??
                  false
                );
              },
              numberOfInputs: 0,
            },
          ],
        },
      }));
      const indexColDef: ColDef = {
        field: 'index-column',
        headerName: '',
        valueGetter: 'node.rowIndex + 1',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        sortable: false,
        filter: false,
        lockPinned: true,
        pinned: 'left',
        suppressMovable: true,
        cellStyle: { 'background-color': '#fafafa' },
      };
      this.colDefs.unshift(indexColDef);
      this.rowData = rows.map((row) =>
        headers.reduce((acc: any, header, i) => {
          acc[header] = row[i];
          return acc;
        }, {})
      );
      headers.forEach((headerKey) => {
        const seenValues = new Set<string>();
        const duplicatedValues = new Set<string>();
        this.rowData.forEach((row) => {
          const value = row[headerKey];
          if (seenValues.has(value)) {
            duplicatedValues.add(value);
          } else {
            seenValues.add(value);
          }
        });
        this.duplicateValueMap.set(headerKey, Array.from(duplicatedValues));
      });

      this.count.set(this.rowData.length);
      this.displayCount.set(this.rowData.length);
      this.gridApi.updateGridOptions({
        columnDefs: this.colDefs,
        rowData: this.rowData,
      });
      this.gridApi.autoSizeAllColumns();
    };
    reader.readAsText(file);
  }

  exportCsv() {
    const columnIds =
      this.gridApi
        .getColumns()
        ?.filter((col) => col.getColDef().field !== 'index-column')
        .map((col) => col.getColId()) ?? [];
    this.gridApi.exportDataAsCsv({ columnKeys: columnIds });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onRowSelected(event: RowSelectedEvent) {
    this.rowSelected.set(event.node.isSelected() ?? false);
  }

  onFilterChanged() {
    this.displayCount.set(this.gridApi.getDisplayedRowCount());
  }

  deleteSelectedRows() {
    if (!this.rowSelected()) return;
    const selectedData = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({ remove: selectedData })!;
  }

  addRow() {
    this.gridApi.applyTransaction({
      add: [{}],
    });
  }

  openAddColumnDialog() {
    this.dialog
      .open(AddColumnDialogComponent)
      .afterClosed()
      .subscribe((columnName) => {
        if (columnName) {
          this.addColumn(columnName);
        }
      });
  }

  addColumn(columnName: string) {
    const newCol = {
      field: columnName,
      headerName: columnName,
      cellEditor: 'agTextCellEditor',
    };
    this.colDefs.push(newCol);
    this.gridApi.updateGridOptions({ columnDefs: this.colDefs });
  }

  openReplaceColumnValueDialog(): void {
    const headerKeys = this.gridApi.getColumnState().map((col) => col.colId);
    this.dialog
      .open(ReplaceColumnValueDialogComponent, {
        data: {
          headerKeys,
          rowData: this.rowData,
        },
      })
      .afterClosed()
      .subscribe((replaceColumnValue: ReplaceColumnValue | undefined) => {
        if (replaceColumnValue !== undefined) {
          const { columnKey, target, replace, replaceType, newColumnName } =
            replaceColumnValue;
          switch (replaceType) {
            case 'replace':
              this.replaceColumnValue(columnKey, target, replace);
              break;
            case 'add':
              this.replaceColumnValueAndAddColumn(
                columnKey,
                target,
                replace,
                newColumnName!
              );
              break;
          }
        }
      });
  }

  replaceColumnValue(
    targetColumnKey: string,
    targetValue: string,
    replaceValue: string
  ): void {
    this.rowData.forEach((row) => {
      if (row[targetColumnKey] === targetValue) {
        row[targetColumnKey] = replaceValue;
      }
    });
    this.gridApi.updateGridOptions({ rowData: this.rowData });
  }

  replaceColumnValueAndAddColumn(
    columnKey: string,
    target: string,
    replace: string,
    newColumnName: string
  ): void {
    this.rowData.forEach((row) => {
      if (row[columnKey] === target) {
        row[newColumnName] = replace;
      } else {
        row[newColumnName] = row[columnKey];
      }
    });
    this.addColumn(newColumnName);
    this.gridApi.updateGridOptions({ rowData: this.rowData });
  }
}
