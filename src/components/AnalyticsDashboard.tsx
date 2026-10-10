import React, { useState, useEffect } from 'react';
import {
  Users,
  Download,
  TrendingUp,
  Smartphone,
  Clock,
  Activity,
  RefreshCw,
  Eye,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import {
  AnalyticsData,
  getAnalyticsData,
  subscribeToAnalytics,
  syncFromGlobalCloud,
} from '../utils/analytics';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>(() => getAnalyticsData());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('جاري المزامنة...');

  // Sync real cloud data on mount and listen to changes
  useEffect(() => {
    let isMounted = true;

    syncFromGlobalCloud().then((fresh) => {
      if (isMounted) {
        setData(fresh);
        setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      }
    });

    const unsubscribe = subscribeToAnalytics((updated) => {
      if (isMounted) {
        setData(updated);
        setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await syncFromGlobalCloud();
      setData(fresh);
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Real calculations based on actual hits
  const conversionRate =
    data.totalVisitors > 0
      ? ((data.totalDownloads / data.totalVisitors) * 100).toFixed(1)
      : '0.0';

  const totalDeviceHits =
    (data.deviceCounts.android || 0) +
    (data.deviceCounts.ios || 0) +
    (data.deviceCounts.windows || 0) +
    (data.deviceCounts.mac || 0) +
    (data.deviceCounts.other || 0);

  const androidPct =
    totalDeviceHits > 0
      ? Math.round(((data.deviceCounts.android || 0) / totalDeviceHits) * 100)
      : 0;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ar-EG').format(num || 0);
  };

  const formatTimeAgo = (ts: number): string => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return 'منذ لحظات';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${Math.floor(diffHours / 24)} يوم`;
  };

  return (
    <div className="w-full bg-[#081736] border border-cyan-500/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-right">
      {/* Top Header of Analytics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Cloud className="w-3.5 h-3.5" />
            مزامنة سحابية حية (Real-time Global Cloud)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>مؤشرات الزوار والتحميلات الحقيقية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            إحصائيات فعلية ومباشرة بدون أي أرقام تقديرية — تُحسب لحظياً عند كل زيارة أو تنزيل فعلي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            آخر تحديث: {lastSyncTime}
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className={`px-3.5 py-2.5 rounded-xl bg-[#0a1c42] hover:bg-[#0d2352] border border-white/10 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              isRefreshing ? 'opacity-80' : ''
            }`}
            title="تحديث الإحصائيات من السحابة"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث حي</span>
          </button>
        </div>
      </div>

      {/* 4 Main Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Real Website Visitors */}
        <div className="bg-[#06132e] border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              إجمالي الزوار الفعليين
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
            {formatNumber(data.totalVisitors)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-white/5">
            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              +{formatNumber(data.todayVisitors)} اليوم
            </span>
            <span className="text-slate-400">
              فريد: {formatNumber(data.uniqueVisitors)}
            </span>
          </div>
        </div>

        {/* Card 2: Real Total Downloads */}
        <div className="bg-[#06132e] border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              من قاموا بالتحميل فعلياً
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
            {formatNumber(data.totalDownloads)}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-white/5">
            <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-full">
              +{formatNumber(data.todayDownloads)} اليوم
            </span>
            <span className="text-slate-400 font-mono">
              Shabakati.apk
            </span>
          </div>
        </div>

        {/* Card 3: Real Conversion Rate */}
        <div className="bg-[#06132e] border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              معدل التحويل الفعلي
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
            {conversionRate}%
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, parseFloat(conversionRate))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>نسبة التحميل من الزوار</span>
              <span>{parseFloat(conversionRate) > 0 ? 'نشط' : 'بانتظار الزيارات'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Top Devices */}
        <div className="bg-[#06132e] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              أجهزة الزوار
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
            {androidPct}%
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-white/5 text-slate-400">
            <span className="text-amber-400 font-semibold">أندرويد: {data.deviceCounts.android || 0}</span>
            <span>كمبيوتر: {data.deviceCounts.windows || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Live Activity Feed */}
      <div className="bg-[#06132e] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>سجل النشاطات الحية المباشرة</span>
        </h3>

        {data.recentActivities && data.recentActivities.length > 0 ? (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {data.recentActivities.slice(0, 10).map((act) => {
              const isDownload = act.type === 'download';
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0a1c42]/60 border border-white/5 text-xs transition-colors hover:border-white/15"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        isDownload
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {isDownload ? (
                        <Download className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-white">
                        {isDownload ? 'عملية تحميل حقيقية' : 'زيارة للموقع'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {act.details || (isDownload ? 'Shabakati.apk' : 'زيارة صفحة التنزيل')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {act.device} · {act.browser}
                    </span>
                    <span className="font-mono">{formatTimeAgo(act.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            لا توجد نشاطات مسجلة بعد — ستظهر العمليات هنا فور حدوث أول زيارة أو تحميل.
          </div>
        )}
      </div>
    </div>
  );
};
