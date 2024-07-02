import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AgGridAngular],
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

  // Import CSV file
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    // eslint-disable-next-line no-console
    console.log('Selected file:', file);
    const reader = new FileReader();
    reader.onload = () => {
      const csvData = reader.result as string;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map((line) => line.split(','));

      this.colDefs = headers.map((header) => ({ field: header }));
      this.rowData = rows.map((row) =>
        headers.reduce((acc: any, header, i) => {
          acc[header] = row[i];
          return acc;
        }, {})
      );
    };
    reader.readAsText(file);
  }

  // Export CSV file
  exportCsv() {
    this.gridApi.exportDataAsCsv();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }
}
