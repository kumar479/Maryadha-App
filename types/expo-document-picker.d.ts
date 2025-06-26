declare module 'expo-document-picker' {
  export interface DocumentPickerAsset {
    uri: string;
    name: string;
    size: number;
    mimeType?: string;
    lastModified?: number;
    file?: File;
  }

  export interface DocumentPickerResult {
    type: 'success' | 'cancel';
    assets?: DocumentPickerAsset[];
    canceled: boolean;
  }

  export function getDocumentAsync(options: {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
    multiple?: boolean;
  }): Promise<DocumentPickerResult>;
} 