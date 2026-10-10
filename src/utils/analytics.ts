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
  deviceCounts: {
    android: number;
    ios: number;
    windows: number;
    mac: number;
    other: number;
  };
  recentActivities: ActivityItem[];
}

const ANALYTICS_STORAGE_KEY = 'shabakati_analytics_v1';
const UNIQUE_VISITOR_KEY = 'shabakati_unique_user_id';
const SESSION_VISIT_KEY = 'shabakati_session_visited_flag';

// Detect client device
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

// Get today's ISO date string: YYYY-MM-DD
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Initial realistic baseline data matching app status
const DEFAULT_ANALYTICS: AnalyticsData = {
  totalVisitors: 21850,
  uniqueVisitors: 18420,
  todayVisitors: 142,
  totalDownloads: 15420,
  todayDownloads: 86,
  lastDateString: getTodayDateString(),
  deviceCounts: {
    android: 18450,
    ios: 1220,
    windows: 1980,
    mac: 140,
    other: 60,
  },
  recentActivities: [
    {
      id: 'act-1',
      type: 'download',
      timestamp: Date.now() - 1000 * 60 * 8,
      device: 'Android',
      browser: 'Chrome',
      details: 'Shabakati.apk (22.5 MB)',
    },
    {
      id: 'act-2',
      type: 'visit',
      timestamp: Date.now() - 1000 * 60 * 14,
      device: 'Android',
      browser: 'Samsung',
      details: 'زيارة لصفحة التنزيل',
    },
    {
      id: 'act-3',
      type: 'download',
      timestamp: Date.now() - 1000 * 60 * 25,
      device: 'Android',
      browser: 'Chrome',
      details: 'Shabakati.apk (22.5 MB)',
    },
    {
      id: 'act-4',
      type: 'visit',
      timestamp: Date.now() - 1000 * 60 * 42,
      device: 'Windows',
      browser: 'Edge',
      details: 'زيارة واستعراض المواصفات',
    },
  ],
};

// Broadcast channel for real-time live synchronization between tabs
let statsChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    statsChannel = new BroadcastChannel('shabakati_analytics_channel');
  } catch {
    statsChannel = null;
  }
}

// Load current analytics from storage
export function getAnalyticsData(): AnalyticsData {
  if (typeof window === 'undefined') return DEFAULT_ANALYTICS;

  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(DEFAULT_ANALYTICS));
      return DEFAULT_ANALYTICS;
    }

    const data: AnalyticsData = JSON.parse(raw);
    const today = getTodayDateString();

    // Reset daily counters if day has changed
    if (data.lastDateString !== today) {
      data.todayVisitors = 0;
      data.todayDownloads = 0;
      data.lastDateString = today;
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch {
    return DEFAULT_ANALYTICS;
  }
}

// Save analytics data
export function saveAnalyticsData(data: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
    if (statsChannel) {
      statsChannel.postMessage({ type: 'ANALYTICS_UPDATED', data });
    }
  } catch (err) {
    console.error('Failed to save analytics data:', err);
  }
}

// Record a website visit
export function recordVisitorHit(): void {
  if (typeof window === 'undefined') return;

  try {
    const isNewSession = !sessionStorage.getItem(SESSION_VISIT_KEY);
    const hasUniqueId = !!localStorage.getItem(UNIQUE_VISITOR_KEY);

    if (!hasUniqueId) {
      localStorage.setItem(UNIQUE_VISITOR_KEY, `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
    }

    const data = getAnalyticsData();
    const { device, browser } = detectDevice();

    // Increment overall pageview
    data.totalVisitors += 1;
    data.todayVisitors += 1;

    // Increment unique visitor if never seen before
    if (!hasUniqueId) {
      data.uniqueVisitors += 1;
    }

    // Update device stats
    if (device === 'Android') data.deviceCounts.android += 1;
    else if (device === 'iPhone') data.deviceCounts.ios += 1;
    else if (device === 'Windows') data.deviceCounts.windows += 1;
    else if (device === 'Mac') data.deviceCounts.mac += 1;
    else data.deviceCounts.other += 1;

    // Log recent activity for new session
    if (isNewSession) {
      sessionStorage.setItem(SESSION_VISIT_KEY, 'true');
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'visit',
        timestamp: Date.now(),
        device,
        browser,
        details: 'زيارة لصفحة التنزيل الرئيسية',
      };
      data.recentActivities = [newActivity, ...(data.recentActivities || [])].slice(0, 30);
    }

    saveAnalyticsData(data);
  } catch (e) {
    console.warn('Analytics visit record error:', e);
  }
}

// Record an app download
export function recordDownloadHit(fileName: string = 'Shabakati.apk'): void {
  if (typeof window === 'undefined') return;

  try {
    const data = getAnalyticsData();
    const { device, browser } = detectDevice();

    data.totalDownloads += 1;
    data.todayDownloads += 1;

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      type: 'download',
      timestamp: Date.now(),
      device,
      browser,
      details: `تحميل تطبيق ${fileName}`,
    };

    data.recentActivities = [newActivity, ...(data.recentActivities || [])].slice(0, 30);
    saveAnalyticsData(data);
  } catch (e) {
    console.warn('Analytics download record error:', e);
  }
}

// Reset analytics counters
export function resetAnalyticsData(): AnalyticsData {
  const empty: AnalyticsData = {
    totalVisitors: 0,
    uniqueVisitors: 0,
    todayVisitors: 0,
    totalDownloads: 0,
    todayDownloads: 0,
    lastDateString: getTodayDateString(),
    deviceCounts: {
      android: 0,
      ios: 0,
      windows: 0,
      mac: 0,
      other: 0,
    },
    recentActivities: [],
  };
  saveAnalyticsData(empty);
  return empty;
}

// Update base counters manually (for admin customization)
export function setCustomCounterValues(visitors: number, downloads: number): AnalyticsData {
  const data = getAnalyticsData();
  data.totalVisitors = Math.max(0, visitors);
  data.uniqueVisitors = Math.max(0, Math.round(visitors * 0.85));
  data.totalDownloads = Math.max(0, downloads);
  saveAnalyticsData(data);
  return data;
}

// Subscribe to real-time updates in tabs
export function subscribeToAnalytics(callback: (data: AnalyticsData) => void): () => void {
  if (!statsChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'ANALYTICS_UPDATED' && event.data.data) {
      callback(event.data.data);
    }
  };

  statsChannel.addEventListener('message', handler);
  return () => {
    statsChannel?.removeEventListener('message', handler);
  };
}
