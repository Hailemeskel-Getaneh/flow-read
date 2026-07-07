/**
 * TypeScript types for PDF document viewer and reader.
 */
export interface PdfDocument {
  uri: string;
  filename: string;
  totalPages: number;
  currentPage: number;
  fileSize?: number;
}

export interface PdfViewerProps {
  uri: string | null;
  onPickPdf: () => void;
  onPageChange?: (page: number, total: number) => void;
  initialPage?: number;
}

export interface PdfBookmark {
  id: string;
  pageNumber: number;
  label: string;
  createdAt: number;
}

export interface ReadingProgress {
  documentId: string;
  lastPage: number;
  totalPages: number;
  timestamp: number;
}
