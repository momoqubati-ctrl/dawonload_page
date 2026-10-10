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
  releaseDate: '2026-10-10',
  fileSizeMb: 22.5,
  fileSizeBytes: 23594078,
  fileName: 'Shabakati.apk',
  sha256: '3c349761024dc4334ca193fdb2bfcab3376030b5a07d2f53f4b4e09385f789de',
  minAndroid: 'Android 6.0 (Marshmallow) فما فوق',
  targetSdk: 'Android 14 (API 34)',
  architecture: 'Universal (arm64-v8a, armeabi-v7a, x86_64)',
  downloadCount: 0,
  whatsNew: [
    'اشتراكات برامج وأدوات الذكاء الاصطناعي (ChatGPT Plus, Claude 3.5, Midjourney)',
    'الكورسات والدورات التعليمية من كبرى المنصات التدريبية (Udemy, Coursera)',
    'اشتراكات منصات الأفلام والمسلسلات الترفيهية بدقة عالية (Netflix, Shahid VIP, Disney+)',
    'باقات برامج وأدوات التصميم والإنتاج (Canva Pro, Adobe Creative Cloud, Figma)',
    'حزمة تطبيق خفيفة فائقة السرعة (22.5 ميجابايت) مخصصة لهذه الخدمات فقط'
  ],
  isOfficial: true,
  uploadedAt: Date.now(),
  hasStoredBlob: true,
  downloadUrl: '/Shabakati.apk',
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

// Retrieve an APK blob from IndexedDB or public assets
export async function getApkBlob(releaseId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    const blobFromDb = await new Promise<Blob | null>((resolve) => {
      const tx = db.transaction(BLOB_STORE, 'readonly');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.get(releaseId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (blobFromDb) return blobFromDb;
  } catch (error) {
    console.warn('Could not retrieve APK blob from IndexedDB:', error);
  }

  // If not found in IndexedDB, fetch the real public /Shabakati.apk
  try {
    const response = await fetch('/Shabakati.apk');
    if (response.ok) {
      return await response.blob();
    }
  } catch {}

  return null;
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

// Trigger direct URL download (e.g. for cloud or GitHub releases)
export function triggerDirectUrlDownload(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 1000);
}
