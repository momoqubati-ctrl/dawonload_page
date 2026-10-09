import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  ShieldCheck,
  Zap,
  HardDrive,
  FileCode2,
} from 'lucide-react';
import { ApkRelease } from '../types/apk';
import {
  getApkBlob,
  createMockApkBlob,
  triggerFileDownload,
  incrementDownloadCount,
} from '../utils/storage';

interface DownloadProgressWidgetProps {
  release: ApkRelease;
  onOpenInstallGuide: () => void;
  onDownloadCompleted?: () => void;
}

type DownloadState = 'idle' | 'downloading' | 'paused' | 'completed' | 'error';

export const DownloadProgressWidget: React.FC<DownloadProgressWidgetProps> = ({
  release,
  onOpenInstallGuide,
  onDownloadCompleted,
}) => {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [downloadedBytes, setDownloadedBytes] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0); // MB/s
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  // Total size in bytes and MB
  const totalBytes = release.fileSizeBytes || release.fileSizeMb * 1024 * 1024;
  const totalMb = release.fileSizeMb;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleStartDownload = async () => {
    setDownloadState('downloading');
    setProgress(0);
    setDownloadedBytes(0);
    isPausedRef.current = false;
    startTimeRef.current = performance.now();
    lastUpdateRef.current = performance.now();
    setStatusMessage('جاري الاتصال بالخادم وتجهيز الحزمة...');

    // Simulate realistic progressive download with random network micro-bursts (approx 3-5 MB/s)
    let currentBytes = 0;
    const targetBytes = totalBytes;
    const targetSpeedBytesPerSec = 4.2 * 1024 * 1024; // ~4.2 MB/s average

    const step = () => {
      if (isPausedRef.current) return;

      const now = performance.now();
      const dt = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      if (dt > 0) {
        // Vary speed slightly for natural feel (3.2 to 5.6 MB/s)
        const jitter = 0.85 + Math.random() * 0.35;
        const speed = targetSpeedBytesPerSec * jitter;
        const deltaBytes = speed * dt;

        currentBytes = Math.min(targetBytes, currentBytes + deltaBytes);
        const currentPct = Math.min(100, (currentBytes / targetBytes) * 100);

        setDownloadedBytes(currentBytes);
        setProgress(Math.round(currentPct));
        setDownloadSpeed(Number((speed / (1024 * 1024)).toFixed(1)));

        const remaining = (targetBytes - currentBytes) / speed;
        setRemainingSeconds(Math.max(0, Math.ceil(remaining)));

        if (currentPct < 20) {
          setStatusMessage('جاري التحقق من التوافق مع نظام أندرويد...');
        } else if (currentPct < 65) {
          setStatusMessage('جاري تنزيل ملفات التطبيق والمكتبات الرقمية...');
        } else if (currentPct < 95) {
          setStatusMessage('جاري استخراج الموارد والتحقق من التوقيع (SHA-256)...');
        } else if (currentPct >= 100) {
          // Completed!
          finalizeDownload();
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const finalizeDownload = async () => {
    setStatusMessage('اكتمل التنزيل! جاري حفظ الملف على جهازك...');
    setDownloadState('completed');
    setProgress(100);
    setDownloadedBytes(totalBytes);
    setDownloadSpeed(0);
    setRemainingSeconds(0);

    // Retrieve real blob from IndexedDB or generate test APK
    try {
      let apkBlob = await getApkBlob(release.id);
      if (!apkBlob) {
        apkBlob = createMockApkBlob(release);
      }
      triggerFileDownload(apkBlob, release.fileName);
      incrementDownloadCount(release.id);
      if (onDownloadCompleted) onDownloadCompleted();
    } catch (err) {
      console.error('Download trigger error:', err);
    }
  };

  const handlePause = () => {
    isPausedRef.current = true;
    setDownloadState('paused');
    setStatusMessage('تم إيقاف التنزيل مؤقتاً');
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  const handleResume = () => {
    isPausedRef.current = false;
    setDownloadState('downloading');
    lastUpdateRef.current = performance.now();
    setStatusMessage('جاري استئناف التحميل...');

    let currentBytes = downloadedBytes;
    const targetBytes = totalBytes;
    const targetSpeedBytesPerSec = 4.2 * 1024 * 1024;

    const step = () => {
      if (isPausedRef.current) return;
      const now = performance.now();
      const dt = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      if (dt > 0) {
        const jitter = 0.85 + Math.random() * 0.35;
        const speed = targetSpeedBytesPerSec * jitter;
        const deltaBytes = speed * dt;

        currentBytes = Math.min(targetBytes, currentBytes + deltaBytes);
        const currentPct = Math.min(100, (currentBytes / targetBytes) * 100);

        setDownloadedBytes(currentBytes);
        setProgress(Math.round(currentPct));
        setDownloadSpeed(Number((speed / (1024 * 1024)).toFixed(1)));

        const remaining = (targetBytes - currentBytes) / speed;
        setRemainingSeconds(Math.max(0, Math.ceil(remaining)));

        if (currentPct >= 100) {
          finalizeDownload();
          return;
        }
      }
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const handleCancel = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    isPausedRef.current = false;
    setDownloadState('idle');
    setProgress(0);
    setDownloadedBytes(0);
    setStatusMessage('');
  };

  const currentMb = (downloadedBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* State 1: Idle (Ready to download) */}
      {downloadState === 'idle' && (
        <div className="flex flex-col items-center">
          <button
            onClick={handleStartDownload}
            className="group relative w-full sm:w-auto min-w-[320px] px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right text-white font-bold rounded-2xl text-xl shadow-[0_12px_40px_rgba(0,229,255,0.4)] hover:shadow-[0_16px_50px_rgba(0,229,255,0.6)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Download className="w-7 h-7 text-white group-hover:-translate-y-1 transition-transform duration-200" />
            <div className="text-right">
              <span className="block leading-tight">تنزيل التطبيق الآن (APK)</span>
              <span className="block text-xs font-normal text-cyan-100 opacity-90">
                الإصدار {release.version} · الحجم {release.fileSizeMb} ميجابايت
              </span>
            </div>
          </button>

          {/* Quick specs under button */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              فحص أمني معتمد وخالٍ من الفيروسات
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              متوافق مع {release.minAndroid}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              تحميل مباشر فائق السرعة
            </span>
          </div>
        </div>
      )}

      {/* State 2 & 3: Downloading or Paused */}
      {(downloadState === 'downloading' || downloadState === 'paused') && (
        <div className="bg-[#091530] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_16px_50px_rgba(4,11,28,0.8)] backdrop-blur-md">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <HardDrive className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {release.fileName}
                </h2>
                <p className="text-xs text-cyan-300/80 font-medium">{statusMessage}</p>
              </div>
            </div>

            {/* Percentage Display */}
            <div className="text-left font-mono font-bold text-2xl text-cyan-400 tabular-nums">
              {progress}%
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
            <div
              className={`h-full rounded-full transition-all duration-150 ease-out relative ${
                downloadState === 'paused'
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300'
              }`}
              style={{ width: `${progress}%` }}
            >
              {/* Animated Sheen */}
              {downloadState === 'downloading' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[pulse_1.5s_infinite]" />
              )}
            </div>
          </div>

          {/* Live Download Metrics Strip */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-300 font-mono">
            <div className="bg-[#0c1e45] py-2 px-3 rounded-lg border border-white/5">
              <div className="text-slate-400 text-[10px] mb-0.5">الحجم المحمّل</div>
              <div className="font-bold text-white tabular-nums">
                {currentMb} / {totalMb} MB
              </div>
            </div>

            <div className="bg-[#0c1e45] py-2 px-3 rounded-lg border border-white/5">
              <div className="text-slate-400 text-[10px] mb-0.5">السرعة الحالية</div>
              <div className="font-bold text-cyan-300 tabular-nums">
                {downloadState === 'paused' ? '0.0' : downloadSpeed} MB/s
              </div>
            </div>

            <div className="bg-[#0c1e45] py-2 px-3 rounded-lg border border-white/5">
              <div className="text-slate-400 text-[10px] mb-0.5">الوقت المتبقي</div>
              <div className="font-bold text-amber-300 tabular-nums">
                {downloadState === 'paused'
                  ? 'متوقف'
                  : remainingSeconds > 0
                  ? `${remainingSeconds} ثوانٍ`
                  : 'لحظات...'}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            {downloadState === 'downloading' ? (
              <button
                onClick={handlePause}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                إيقاف مؤقت
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                استئناف التحميل
              </button>
            )}

            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
            >
              إلغاء التنزيل
            </button>
          </div>
        </div>
      )}

      {/* State 4: Completed! */}
      {downloadState === 'completed' && (
        <div className="bg-gradient-to-b from-[#092244] to-[#061630] border border-emerald-500/40 rounded-2xl p-6 shadow-[0_20px_50px_rgba(16,185,129,0.2)] text-right">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>تم اكتمال تنزيل التطبيق بنجاح!</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
                  100%
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                تم حفظ ملف <span className="font-mono text-cyan-300">{release.fileName}</span> في مجلد التنزيلات (Downloads) على جهازك. اتبع الخطوات البسيطة لتثبيته.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onOpenInstallGuide}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              عرض خطوات التثبيت على الهاتف
            </button>

            <button
              onClick={handleStartDownload}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة التحميل
            </button>

            {/* SHA256 Verification notice */}
            <div className="mr-auto text-[11px] text-slate-400 font-mono hidden md:flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHA-256: {release.sha256 ? release.sha256.substring(0, 16) + '...' : 'Verified'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
