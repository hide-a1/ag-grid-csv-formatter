import { AG_GRID_LOCALE_JP } from '@ag-grid-community/locale';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AgGridAngular, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private gridApi!: GridApi;

  themeClass = 'ag-theme-quartz';
  // Row Data: The data to be displayed.
  rowData: any[] = [];
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
  rowSelected = false;
  newColumnName = signal('');
  localText = AG_GRID_LOCALE_JP;

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
      const csvData = reader.result as string;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map((line) => line.split(','));

      this.colDefs = headers.map((header, i) => ({
        field: header,
        cellEditor: 'agTextCellEditor',
      }));
      const indexColDef: ColDef = {
        field: 'index',
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
        ?.filter((col) => col.getColDef().field !== 'index')
        .map((col) => col.getColId()) ?? [];
    this.gridApi.exportDataAsCsv({ columnKeys: columnIds });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onRowSelected(event: RowSelectedEvent) {
    this.rowSelected = event.node.isSelected() ?? false;
  }

  deleteSelectedRows() {
    const selectedData = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({ remove: selectedData })!;
  }

  addRow() {
    this.gridApi.applyTransaction({
      add: [{}],
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
    this.newColumnName.set('');
  }
}
