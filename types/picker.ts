export interface FilePickResult {
  canceled: boolean;
  uri?: string;
  name?: string;
  size?: number;
  mimeType?: string;
}
