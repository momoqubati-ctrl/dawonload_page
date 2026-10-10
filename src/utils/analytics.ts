export interface ActivityItem {
  id: string;
  type: 'visit' | 'download';
  timestamp: number;
  device: 'Android' | 'iPhone' | 'Windows' | 'Mac' | 'Linux' | 'Other';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Samsung' | 'Other';
  details?: string;
}

export interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  todayVisitors: number;
  totalDownloads: number;
  todayDownloads: number;
  lastDateString: string;
  isCloudSynced: boolean;
  deviceCounts: {
    android: number;
    ios: number;
    windows: number;
    mac: number;
    other: number;
  };
  recentActivities: ActivityItem[];
}

const ANALYTICS_STORAGE_KEY = 'shabakati_analytics_real_v2';
const UNIQUE_VISITOR_KEY = 'shabakati_unique_user_id_v2';
const SESSION_VISIT_KEY = 'shabakati_session_visited_flag_v2';
const CLOUD_NAMESPACE = 'shabakati_app_prod_2026';
const CLOUD_API_BASE = 'https://abacus.jasoncameron.dev';

// Clean up old fake cache from previous versions
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('shabakati_analytics_v1');
    localStorage.removeItem('shabakati_session_visited_flag');
  } catch {}
}

// Get today's ISO date string: YYYY-MM-DD
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Initial clean 100% real baseline data (starts at 0)
const REAL_DEFAULT_ANALYTICS: AnalyticsData = {
  totalVisitors: 0,
  uniqueVisitors: 0,
  todayVisitors: 0,
  totalDownloads: 0,
  todayDownloads: 0,
  lastDateString: getTodayDateString(),
  isCloudSynced: false,
  deviceCounts: {
    android: 0,
    ios: 0,
    windows: 0,
    mac: 0,
    other: 0,
  },
  recentActivities: [],
};

// Detect client device & browser
export function detectDevice(): {
  device: ActivityItem['device'];
  browser: ActivityItem['browser'];
} {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return { device: 'Other', browser: 'Other' };
  }

  const ua = navigator.userAgent.toLowerCase();

  let device: ActivityItem['device'] = 'Other';
  if (/android/.test(ua)) device = 'Android';
  else if (/iphone|ipad|ipod/.test(ua)) device = 'iPhone';
  else if (/windows/.test(ua)) device = 'Windows';
  else if (/macintosh|mac os x/.test(ua)) device = 'Mac';
  else if (/linux/.test(ua)) device = 'Linux';

  let browser: ActivityItem['browser'] = 'Other';
  if (/samsungbrowser/.test(ua)) browser = 'Samsung';
  else if (/edg\//.test(ua)) browser = 'Edge';
  else if (/firefox|fxios/.test(ua)) browser = 'Firefox';
  else if (/chrome|crios/.test(ua)) browser = 'Chrome';
  else if (/safari/.test(ua)) browser = 'Safari';

  return { device, browser };
}

// Broadcast channel for real-time live synchronization between tabs on same device
let statsChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    statsChannel = new BroadcastChannel('shabakati_real_analytics_channel');
  } catch {
    statsChannel = null;
  }
}

// Cloud API: Get counter value (does NOT increment)
async function fetchCloudValue(key: string): Promise<number | null> {
  try {
    const res = await fetch(`${CLOUD_API_BASE}/get/${CLOUD_NAMESPACE}/${key}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.status === 404) return 0;
    if (res.ok) {
      const data = await res.json();
      return typeof data.value === 'number' ? data.value : 0;
    }
  } catch (err) {
    console.warn(`Cloud get ${key} error:`, err);
  }
  return null;
}

// Cloud API: Increment counter value (returns updated integer)
async function hitCloudValue(key: string): Promise<number | null> {
  try {
    const res = await fetch(`${CLOUD_API_BASE}/hit/${CLOUD_NAMESPACE}/${key}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return typeof data.value === 'number' ? data.value : null;
    }
  } catch (err) {
    console.warn(`Cloud hit ${key} error:`, err);
  }
  return null;
}

// Load cached analytics from storage
export function getAnalyticsData(): AnalyticsData {
  if (typeof window === 'undefined') return REAL_DEFAULT_ANALYTICS;

  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(REAL_DEFAULT_ANALYTICS));
      return REAL_DEFAULT_ANALYTICS;
    }

    const data: AnalyticsData = JSON.parse(raw);
    const today = getTodayDateString();

    // Reset daily counters locally if date changed
    if (data.lastDateString !== today) {
      data.todayVisitors = 0;
      data.todayDownloads = 0;
      data.lastDateString = today;
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch {
    return REAL_DEFAULT_ANALYTICS;
  }
}

// Save analytics data to local cache & broadcast
export function saveAnalyticsData(data: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
    if (statsChannel) {
      statsChannel.postMessage({ type: 'REAL_ANALYTICS_UPDATED', data });
    }
  } catch (err) {
    console.error('Failed to save analytics data:', err);
  }
}

// Synchronize all stats from the global cloud server (Real data across all users worldwide)
export async function syncFromGlobalCloud(): Promise<AnalyticsData> {
  const current = getAnalyticsData();
  const today = getTodayDateString();

  try {
    const [totalVisits, uniqueVisits, todayVisits, totalDownloads, todayDownloads] =
      await Promise.all([
        fetchCloudValue('visits'),
        fetchCloudValue('unique_visits'),
        fetchCloudValue(`visits_${today}`),
        fetchCloudValue('downloads'),
        fetchCloudValue(`downloads_${today}`),
      ]);

    if (totalVisits !== null) current.totalVisitors = totalVisits;
    if (uniqueVisits !== null) current.uniqueVisitors = uniqueVisits;
    if (todayVisits !== null) current.todayVisitors = todayVisits;
    if (totalDownloads !== null) current.totalDownloads = totalDownloads;
    if (todayDownloads !== null) current.todayDownloads = todayDownloads;

    current.isCloudSynced = true;
    current.lastDateString = today;

    saveAnalyticsData(current);
    return current;
  } catch (err) {
    console.warn('Global cloud sync error:', err);
    return current;
  }
}

// Record a real website visit
export async function recordVisitorHit(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const today = getTodayDateString();
    const isNewSession = !sessionStorage.getItem(SESSION_VISIT_KEY);
    const hasUniqueId = !!localStorage.getItem(UNIQUE_VISITOR_KEY);

    if (!hasUniqueId) {
      localStorage.setItem(
        UNIQUE_VISITOR_KEY,
        `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      );
    }

    const { device, browser } = detectDevice();
    const data = getAnalyticsData();

    // Only count 1 visit per browser session to prevent fake refresh spamming
    if (isNewSession) {
      sessionStorage.setItem(SESSION_VISIT_KEY, 'true');

      // 1. Send hit to Cloud for global cross-device tracking
      const promises: Promise<number | null>[] = [
        hitCloudValue('visits'),
        hitCloudValue(`visits_${today}`),
      ];

      if (!hasUniqueId) {
        promises.push(hitCloudValue('unique_visits'));
      }

      const results = await Promise.all(promises);
      if (results[0] !== null) data.totalVisitors = results[0];
      if (results[1] !== null) data.todayVisitors = results[1];
      if (!hasUniqueId && results[2] !== null) data.uniqueVisitors = results[2];

      // Update local device counter
      if (device === 'Android') data.deviceCounts.android += 1;
      else if (device === 'iPhone') data.deviceCounts.ios += 1;
      else if (device === 'Windows') data.deviceCounts.windows += 1;
      else if (device === 'Mac') data.deviceCounts.mac += 1;
      else data.deviceCounts.other += 1;

      // Add to recent activity log
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'visit',
        timestamp: Date.now(),
        device,
        browser,
        details: 'زيارة لصفحة التنزيل الرئيسية',
      };

      data.recentActivities = [newActivity, ...(data.recentActivities || [])].slice(0, 30);
      data.isCloudSynced = true;
      saveAnalyticsData(data);
    } else {
      // Sync latest cloud numbers quietly
      syncFromGlobalCloud();
    }
  } catch (e) {
    console.warn('Analytics visit record error:', e);
  }
}

// Record a real app download
export async function recordDownloadHit(fileName: string = 'Shabakati.apk'): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const today = getTodayDateString();
    const { device, browser } = detectDevice();
    const data = getAnalyticsData();

    // 1. Hit Cloud for total and today's downloads
    const [newTotalDown, newTodayDown] = await Promise.all([
      hitCloudValue('downloads'),
      hitCloudValue(`downloads_${today}`),
    ]);

    if (newTotalDown !== null) data.totalDownloads = newTotalDown;
    else data.totalDownloads += 1;

    if (newTodayDown !== null) data.todayDownloads = newTodayDown;
    else data.todayDownloads += 1;

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'download',
      timestamp: Date.now(),
      device,
      browser,
      details: `تحميل تطبيق ${fileName}`,
    };

    data.recentActivities = [newActivity, ...(data.recentActivities || [])].slice(0, 30);
    data.isCloudSynced = true;
    saveAnalyticsData(data);
  } catch (e) {
    console.warn('Analytics download record error:', e);
  }
}

// Subscribe to real-time updates in tabs
export function subscribeToAnalytics(callback: (data: AnalyticsData) => void): () => void {
  if (!statsChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'REAL_ANALYTICS_UPDATED' && event.data.data) {
      callback(event.data.data);
    }
  };

  statsChannel.addEventListener('message', handler);
  return () => {
    statsChannel?.removeEventListener('message', handler);
  };
}
