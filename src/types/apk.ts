export interface ApkRelease {
  id: string;
  appName: string;
  packageName: string;
  version: string;
  buildNumber: number;
  releaseDate: string;
  fileSizeMb: number;
  fileSizeBytes: number;
  fileName: string;
  sha256: string;
  md5?: string;
  minAndroid: string;
  targetSdk: string;
  architecture: string;
  downloadCount: number;
  whatsNew: string[];
  isOfficial: boolean;
  uploadedAt: number;
  hasStoredBlob?: boolean;
}

export type PageView = 'download' | 'admin';
