export type FileType = 'pdf' | 'audio';

export interface RecentFileItem {
  id: string;
  type: FileType;
  uri: string;
  filename: string;
  lastOpened: number;
  progressPercent?: number;
}
