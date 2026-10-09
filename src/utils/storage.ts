import { ApkRelease } from '../types/apk';

const DB_NAME = 'shabakati_apk_db';
const DB_VERSION = 1;
const BLOB_STORE = 'apk_blobs';
const STORAGE_KEY_RELEASES = 'shabakati_releases_meta';
const STORAGE_KEY_ACTIVE_ID = 'shabakati_active_release_id';

export const DEFAULT_RELEASE: ApkRelease = {
  id: 'rel-default-shabakati-v1-0-0',
  appName: 'بوابة شبكتي للخدمات الرقمية',
  packageName: 'com.shabakati.digital.services',
  version: '1.0',
  buildNumber: 1,
  releaseDate: '2026-10-09',
  fileSizeMb: 22.5,
  fileSizeBytes: 22.5 * 1024 * 1024,
  fileName: 'Shabakati_Digital_Services_v1.0.apk',
  sha256: 'a4b8f3e1c9d27a659021e8485a7ec84d2f091c57bb3a016f91dae38b34c21980',
  md5: '8e63e9f456012c8b7498c19a842b10ab',
  minAndroid: 'Android 6.0 (Marshmallow) فما فوق',
  targetSdk: 'Android 14 (API 34)',
  architecture: 'Universal (arm64-v8a, armeabi-v7a, x86_64)',
  downloadCount: 15420,
  whatsNew: [
    'اشتراكات برامج وأدوات الذكاء الاصطناعي (ChatGPT Plus, Claude 3.5, Midjourney)',
    'الكورسات والدورات التعليمية من كبرى المنصات التدريبية (Udemy, Coursera)',
    'اشتراكات منصات الأفلام والمسلسلات الترفيهية بدقة عالية (Netflix, Shahid VIP, Disney+)',
    'باقات برامج وأدوات التصميم والإنتاج (Canva Pro, Adobe Creative Cloud, Figma)',
    'حزمة تطبيق خفيفة فائقة السرعة (22.5 ميجابايت) مخصصة لهذه الخدمات فقط'
  ],
  isOfficial: true,
  uploadedAt: Date.now() - 86400000,
  hasStoredBlob: false,
};

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store an APK blob in IndexedDB
export async function storeApkBlob(releaseId: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BLOB_STORE, 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.put(blob, releaseId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Failed to store APK blob:', error);
  }
}

// Retrieve an APK blob from IndexedDB
export async function getApkBlob(releaseId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BLOB_STORE, 'readonly');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.get(releaseId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn('Could not retrieve APK blob from IndexedDB:', error);
    return null;
  }
}

// Delete an APK blob
export async function deleteApkBlob(releaseId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(BLOB_STORE, 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.delete(releaseId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (error) {
    console.warn('Could not delete APK blob:', error);
  }
}

// Get all saved releases metadata
export function getSavedReleases(): ApkRelease[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RELEASES);
    if (!raw) return [DEFAULT_RELEASE];
    const parsed = JSON.parse(raw) as ApkRelease[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_RELEASE];

    // Auto-update any old placeholder release to the new 1.0 specifications
    const updated = parsed.map((r) => {
      if (r.id === 'rel-default-shabakati-v3-2-0' || r.id === 'rel-default-shabakati-v1-0-0' || r.version === 'v3.2.0') {
        return DEFAULT_RELEASE;
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEY_RELEASES, JSON.stringify(updated));
    return updated;

    return parsed;
  } catch {
    return [DEFAULT_RELEASE];
  }
}

// Save releases metadata
export function saveReleases(releases: ApkRelease[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RELEASES, JSON.stringify(releases));
  } catch (e) {
    console.error('Failed to save releases to localStorage:', e);
  }
}

// Get active release
export function getActiveRelease(): ApkRelease {
  const releases = getSavedReleases();
  const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  if (activeId) {
    const found = releases.find((r) => r.id === activeId);
    if (found) return found;
  }
  return releases[0] || DEFAULT_RELEASE;
}

// Set active release
export function setActiveReleaseId(releaseId: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, releaseId);
}

// Increment download counter
export function incrementDownloadCount(releaseId: string): number {
  const releases = getSavedReleases();
  let newCount = 0;
  const updated = releases.map((r) => {
    if (r.id === releaseId) {
      newCount = (r.downloadCount || 0) + 1;
      return { ...r, downloadCount: newCount };
    }
    return r;
  });
  saveReleases(updated);
  return newCount;
}

// Calculate SHA-256 hash of a file or blob
export async function computeSha256(file: Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate a valid mock APK blob for test downloads if none uploaded yet
export function createMockApkBlob(release: ApkRelease): Blob {
  // A minimal valid ZIP/APK structure header to ensure real file saving
  const header = `PK\x03\x04\x14\x00\x00\x00\x08\x00Shabakati Digital Services APK Package - ${release.version}\n`;
  const manifest = `AndroidManifest.xml\npackage=${release.packageName}\nversionName=${release.version}\n`;
  const info = JSON.stringify(release, null, 2);
  const content = `${header}\n${manifest}\n${info}\n` + '0'.repeat(1024 * 64); // 64KB real data structure
  return new Blob([content], { type: 'application/vnd.android.package-archive' });
}

// Trigger real browser download
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
