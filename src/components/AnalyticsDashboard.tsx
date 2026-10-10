import React, { useState, useEffect } from 'react';
import {
  Users,
  Download,
  TrendingUp,
  Smartphone,
  Laptop,
  Clock,
  Activity,
  RefreshCw,
  Settings2,
  CheckCircle2,
  Eye,
  ShieldCheck,
  X,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  AnalyticsData,
  getAnalyticsData,
  subscribeToAnalytics,
  setCustomCounterValues,
  resetAnalyticsData,
} from '../utils/analytics';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>(() => getAnalyticsData());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customVisitors, setCustomVisitors] = useState<string>('');
  const [customDownloads, setCustomDownloads] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Subscribe to real-time sync across tabs
  useEffect(() => {
    const unsubscribe = subscribeToAnalytics((updated) => {
      setData(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    const fresh = getAnalyticsData();
    setData(fresh);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenSettings = () => {
    setCustomVisitors(data.totalVisitors.toString());
    setCustomDownloads(data.totalDownloads.toString());
    setIsSettingsOpen(true);
    setFeedbackMsg('');
  };

  const handleSaveCustomCounters = (e: React.FormEvent) => {
    e.preventDefault();
    const vis = parseInt(customVisitors, 10);
    const down = parseInt(customDownloads, 10);

    if (isNaN(vis) || isNaN(down)) {
      setFeedbackMsg('يرجى إدخال أرقام صحيحة');
      return;
    }

    const updated = setCustomCounterValues(vis, down);
    setData(updated);
    setFeedbackMsg('تم تحديث أرقام الإحصائيات بنجاح!');
    setTimeout(() => {
      setIsSettingsOpen(false);
      setFeedbackMsg('');
    }, 1200);
  };

  const handleReset = () => {
    if (!confirm('هل أنت متأكد من تصفير جميع عدادات الإحصائيات إلى الصفر؟')) return;
    const empty = resetAnalyticsData();
    setData(empty);
    setIsSettingsOpen(false);
  };

  // Calculations
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
      : 85;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ar-EG').format(num);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            إحصائيات المنصة الحية
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>مؤشرات زوار الموقع وعمليات التحميل</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            متابعة فورية ودقيقة لعدد من زار صفحة التنزيل وعدد من قام بتحميل تطبيق شبكتي (APK)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            className={`p-2.5 rounded-xl bg-[#0a1c42] hover:bg-[#0d2352] border border-white/10 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="تحديث الإحصائيات فوراً"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-3.5 py-2.5 rounded-xl bg-[#0a1c42] hover:bg-[#0d2352] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="إدارة وتعديل العدادات"
          >
            <Settings2 className="w-4 h-4 text-cyan-400" />
            <span>تعديل الأرقام</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Website Visitors */}
        <div className="bg-[#06132e] border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              إجمالي زوار الموقع
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

        {/* Card 2: Total Downloads */}
        <div className="bg-[#06132e] border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              عدد من قام بتحميل التطبيق
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

        {/* Card 3: Conversion Rate */}
        <div className="bg-[#06132e] border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              معدل التحويل (التحميل/الزيارة)
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
              <span>تفاعل الزوار</span>
              <span>عالي وممتاز</span>
            </div>
          </div>
        </div>

        {/* Card 4: Top Devices */}
        <div className="bg-[#06132e] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              أجهزة الزوار الأكثر طلباً
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
            {androidPct}%
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-3 border-t border-white/5 text-slate-400">
            <span className="text-amber-400 font-semibold">أجهزة أندرويد (APK)</span>
            <span>+{data.deviceCounts.windows || 0} كمبيوتر</span>
          </div>
        </div>
      </div>

      {/* Recent Live Activity Feed */}
      <div className="bg-[#06132e] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>سجل آخر النشاطات وعمليات التنزيل المباشرة</span>
        </h3>

        {data.recentActivities && data.recentActivities.length > 0 ? (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {data.recentActivities.slice(0, 8).map((act) => {
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
                        {isDownload ? 'عملية تحميل ناجحة' : 'زيارة للموقع'}
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
            لا توجد نشاطات مسجلة بعد
          </div>
        )}
      </div>

      {/* Edit/Customize Counters Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#07132e] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-right relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-cyan-400" />
                تعديل عدادات الإحصائيات
              </h4>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              يمكنك تخصيص الأرقام الأولية لعداد الزوار والتحميلات بما يتناسب مع حجم جمهور تطبيقك.
            </p>

            <form onSubmit={handleSaveCustomCounters} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  إجمالي عدد زوار الموقع
                </label>
                <input
                  type="number"
                  value={customVisitors}
                  onChange={(e) => setCustomVisitors(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  إجمالي عدد من قام بتحميل التطبيق
                </label>
                <input
                  type="number"
                  value={customDownloads}
                  onChange={(e) => setCustomDownloads(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              {feedbackMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="تصفير العدادات"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  تصفير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
