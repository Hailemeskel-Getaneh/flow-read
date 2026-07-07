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
