import { Component, HostListener, Input, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { DocumentModel } from '../../models/document.models';
import { DocumentManagementService } from '../../service/document-management.service';
import { BehaviorSubject } from 'rxjs';

interface SheetData {
  name: string;
  data: any[][];
  headers: string[];
  filteredData?: any[][];
  totalRows: number;
}

@Component({
  selector: 'app-excel-preview',
  templateUrl: './excel-preview.component.html',
  styleUrls: ['./excel-preview.component.css']
})
export class ExcelPreviewComponent implements OnInit {
  @Input() document!: DocumentModel;

  activeSheet: string = '';
  sheets: SheetData[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Search functionality
  searchTerm: string = '';
  showSearchInput = false;
  searchResults$ = new BehaviorSubject<number>(0);
  
  // Pagination
  currentPage = 1;
  pageSize = 50;
  totalPages = 1;

  constructor(
    private documentService: DocumentManagementService,
    private loaderService: LoaderService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadExcelFile();
  }

  async loadExcelFile() {
    try {
      this.isLoading = true;
      this.error = null;
  
      const response = await this.documentService.previewDocument(this.document.id).toPromise();
      if (!response) throw new Error('Failed to load document');
  
      // Ensure we have a Blob
      const blob = response as Blob;
      if (!(blob instanceof Blob)) throw new Error('Invalid response type');
  
      const buffer = await blob.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        type: 'array',
        cellDates: true,
        cellNF: true,
        cellStyles: true
      });
  
      this.sheets = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const headers = (rawData[0] || []) as string[];
        const data = rawData.slice(1) as any[][];
        
        return {
          name: sheetName,
          data,
          headers,
          totalRows: data.length
        };
      });
  
      if (this.sheets.length > 0) {
        this.activeSheet = this.sheets[0].name;
        this.updatePagination();
      }
  
    } catch (error) {
      console.error('Error loading Excel file:', error);
      this.error = 'Failed to load Excel file';
      this.toastService.showError('Failed to load Excel preview');
    } finally {
      this.isLoading = false;
    }
  }

  switchSheet(sheetName: string) {
    this.activeSheet = sheetName;
    this.currentPage = 1;
    this.clearSearch();
    this.updatePagination();
  }

  getCurrentSheet(): SheetData | undefined {
    return this.sheets.find(sheet => sheet.name === this.activeSheet);
  }

  getVisibleData(): any[][] {
    const sheet = this.getCurrentSheet();
    if (!sheet) return [];

    const data = sheet.filteredData || sheet.data;
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  // Search functionality
  toggleSearch() {
    this.showSearchInput = !this.showSearchInput;
    if (!this.showSearchInput) {
      this.clearSearch();
    }
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.filterData();
  }

  clearSearch() {
    this.searchTerm = '';
    this.sheets = this.sheets.map(sheet => ({
      ...sheet,
      filteredData: undefined
    }));
    this.updatePagination();
    this.searchResults$.next(0);
  }

  private filterData() {
    const currentSheet = this.getCurrentSheet();
    if (!currentSheet || !this.searchTerm) {
      this.clearSearch();
      return;
    }

    const searchTerm = this.searchTerm.toLowerCase();
    const filteredData = currentSheet.data.filter(row =>
      row.some(cell => 
        this.formatCellValue(cell).toLowerCase().includes(searchTerm)
      )
    );

    this.sheets = this.sheets.map(sheet => 
      sheet.name === this.activeSheet
        ? { ...sheet, filteredData }
        : sheet
    );

    this.searchResults$.next(filteredData.length);
    this.updatePagination();
  }

  // Pagination
  updatePagination() {
    const currentSheet = this.getCurrentSheet();
    if (currentSheet) {
      const totalRows = currentSheet.filteredData?.length || currentSheet.data.length;
      this.totalPages = Math.ceil(totalRows / this.pageSize);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Formatting
  formatCellValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'number') {
      // Format numbers with up to 2 decimal places
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    return String(value);
  }

  getSheetStats(): string {
    const sheet = this.getCurrentSheet();
    if (!sheet) return '';

    const totalRows = sheet.filteredData?.length || sheet.data.length;
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, totalRows);

    return `Showing ${start}-${end} of ${totalRows} rows`;
  }

  // Navigation
  canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  canGoPrevious(): boolean {
    return this.currentPage > 1;
  }
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event) {
    event.preventDefault();
  }

  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent) {
    event.preventDefault();
    return false;
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent) {
    event.preventDefault();
    return false;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    return false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Prevent Ctrl+C, Ctrl+X, Ctrl+V
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'v') {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  @HostListener('window:load', ['$event'])
  onLoad() {
    // Disable the browser's default drag behavior
    document.addEventListener('dragstart', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
  }
}