export interface ErrorState {
  hasError: boolean;
  message: string | null;
  code?: string;
  timestamp?: number;
}
