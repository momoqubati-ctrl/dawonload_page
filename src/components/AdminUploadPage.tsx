import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  FileCode2,
  HardDrive,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { ApkRelease } from '../types/apk';
import {
  storeApkBlob,
  saveReleases,
  getSavedReleases,
  setActiveReleaseId,
  computeSha256,
  deleteApkBlob,
  DEFAULT_RELEASE,
  createMockApkBlob,
  triggerFileDownload,
  triggerDirectUrlDownload,
  getApkBlob,
} from '../utils/storage';
import { LogOut } from 'lucide-react';

interface AdminUploadPageProps {
  currentRelease: ApkRelease;
  onReleaseUpdated: (release: ApkRelease) => void;
  onSwitchToDownload: () => void;
  onLogout: () => void;
}

export const AdminUploadPage: React.FC<AdminUploadPageProps> = ({
  currentRelease,
  onReleaseUpdated,
  onSwitchToDownload,
  onLogout,
}) => {
  const [releases, setReleases] = useState<ApkRelease[]>(getSavedReleases());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [version, setVersion] = useState<string>('1.0');
  const [buildNumber, setBuildNumber] = useState<number>(1);
  const [minAndroid, setMinAndroid] = useState<string>('Android 6.0 (Marshmallow) فما فوق');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [whatsNewList, setWhatsNewList] = useState<string[]>([
    'اشتراكات برامج وأدوات الذكاء الاصطناعي (ChatGPT Plus, Claude 3.5, Midjourney)',
    'الكورسات والدورات التعليمية الاحترافية (Udemy, Coursera, Skillshare)',
    'اشتراكات منصات الأفلام والمسلسلات الترفيهية (Netflix, Shahid VIP, Disney+)',
    'برامج وأدوات التصميم والجرافيك (Canva Pro, Adobe Creative Cloud, Figma)',
    'حجم خفيف فائق السرعة 22.5 ميجابايت مخصص لهذه الخدمات فقط',
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setIsSuccess(false);

    // Auto extract version from filename if it contains 'v'
    const match = file.name.match(/v?(\d+\.\d+(\.\d+)?)/i);
    if (match) {
      setVersion(`v${match[1]}`);
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setWhatsNewList([...whatsNewList, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setWhatsNewList(whatsNewList.filter((_, i) => i !== index));
  };

  const handleUploadRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('الرجاء اختيار ملف APK أولاً');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(15);
    setStatusMessage('جاري قراءة ملف التطبيق وحساب الحجم...');

    try {
      // 1. Compute SHA-256
      setStatusMessage('جاري حساب بصمة التشفير الرقمية (SHA-256)...');
      setUploadProgress(40);
      const sha256 = await computeSha256(selectedFile);

      // 2. Store in IndexedDB
      setStatusMessage('جاري حفظ ملف APK في قاعدة البيانات المحلية...');
      setUploadProgress(70);

      const releaseId = `rel-${Date.now()}`;
      await storeApkBlob(releaseId, selectedFile);

      setUploadProgress(90);
      setStatusMessage('جاري تسجيل بيانات النسخة وتحديث صفحة التنزيل...');

      const fileSizeMb = Number((selectedFile.size / (1024 * 1024)).toFixed(1));

      const newRelease: ApkRelease = {
        id: releaseId,
        appName: 'بوابة شبكتي للخدمات الرقمية',
        packageName: 'com.shabakati.digital.services',
        version: version.trim() || 'v1.0.0',
        buildNumber: buildNumber || 1,
        releaseDate: new Date().toISOString().split('T')[0],
        fileSizeMb: fileSizeMb > 0 ? fileSizeMb : 35.0,
        fileSizeBytes: selectedFile.size,
        fileName: selectedFile.name,
        sha256: sha256,
        minAndroid: minAndroid,
        targetSdk: 'Android 14 (API 34)',
        architecture: 'Universal (arm64-v8a, armeabi-v7a)',
        downloadCount: 0,
        whatsNew: whatsNewList.length > 0 ? whatsNewList : ['إصدار جديد من تطبيق شبكتي'],
        isOfficial: true,
        uploadedAt: Date.now(),
        hasStoredBlob: true,
        downloadUrl: downloadUrl.trim() || undefined,
      };

      const currentReleases = getSavedReleases();
      const updatedList = [newRelease, ...currentReleases];
      saveReleases(updatedList);
      setActiveReleaseId(releaseId);

      setReleases(updatedList);
      onReleaseUpdated(newRelease);

      setUploadProgress(100);
      setIsSuccess(true);
      setStatusMessage('تم رفع نسخة التطبيق وتفعيلها بنجاح!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('حدث خطأ أثناء معالجة ملف APK. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateRelease = (rel: ApkRelease) => {
    setActiveReleaseId(rel.id);
    onReleaseUpdated(rel);
    setReleases(getSavedReleases());
  };

  const handleDeleteRelease = async (releaseId: string) => {
    if (releases.length <= 1) {
      alert('لا يمكن حذف النسخة الوحيدة المتبقية');
      return;
    }
    if (!confirm('هل أنت متأكد من حذف هذه النسخة؟')) return;

    await deleteApkBlob(releaseId);
    const updated = releases.filter((r) => r.id !== releaseId);
    saveReleases(updated);
    setReleases(updated);

    if (currentRelease.id === releaseId) {
      const nextActive = updated[0];
      setActiveReleaseId(nextActive.id);
      onReleaseUpdated(nextActive);
    }
  };

  const handleTestDownload = async (rel: ApkRelease) => {
    const blob = await getApkBlob(rel.id);
    if (blob) {
      triggerFileDownload(blob, rel.fileName);
    } else if (rel.downloadUrl) {
      triggerDirectUrlDownload(rel.downloadUrl, rel.fileName);
    } else {
      const mockBlob = createMockApkBlob(rel);
      triggerFileDownload(mockBlob, rel.fileName);
    }
  };

  const handleResetDefaults = () => {
    if (!confirm('هل تريد إعادة تعيين النسخ إلى النسخة الافتراضية؟')) return;
    saveReleases([DEFAULT_RELEASE]);
    setActiveReleaseId(DEFAULT_RELEASE.id);
    setReleases([DEFAULT_RELEASE]);
    onReleaseUpdated(DEFAULT_RELEASE);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 text-right">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <UploadCloud className="w-4 h-4" />
            لوحة الإدارة والمطور
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            رفع وإدارة نسخ تطبيق شبكتي (APK)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            قم برفع ملف الـ APK الجديد ليتمكن الزوار من تحميله مباشرة من صفحة التنزيل
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
            title="تسجيل الخروج من لوحة الإدارة"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>صفحة التنزيل (واجهة الزوار)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleUploadRelease}
            className="bg-[#081736] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
              رفع حزمة APK جديدة
            </h2>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : 'border-cyan-500/30 hover:border-cyan-400 bg-[#06122c]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive,application/octet-stream"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(2)} ميجابايت
                  </div>
                  <span className="mt-3 text-[11px] text-cyan-300 underline">
                    اضغط لتغيير الملف
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    اسحب ملف APK هنا أو انقر للتصفح
                  </div>
                  <div className="text-xs text-slate-400">
                    يدعم ملفات حزم أندرويد بصيغة (.apk)
                  </div>
                </div>
              )}
            </div>

            {/* Version & Build Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم الإصدار (Version)
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="مثال: v3.2.1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم البناء (Build Number)
                </label>
                <input
                  type="number"
                  value={buildNumber}
                  onChange={(e) => setBuildNumber(Number(e.target.value))}
                  placeholder="321"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>
            </div>

            {/* Min Android Requirement */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الحد الأدنى لنظام التشغيل
              </label>
              <input
                type="text"
                value={minAndroid}
                onChange={(e) => setMinAndroid(e.target.value)}
                placeholder="Android 6.0 (Marshmallow) فما فوق"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            {/* Direct Cloud/GitHub Download URL (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>رابط التحميل السحابي المباشر (اختياري - لنشر التطبيق لجميع الزوار)</span>
                <span className="text-[10px] text-cyan-400 font-mono">GitHub Releases / Direct URL</span>
              </label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://github.com/.../releases/download/.../app.apk"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400 font-mono text-left"
                dir="ltr"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                عند رفع ملف APK من الهاتف سيتم حفظه في ذاكرة متصفحك للاختبار الفوري. لإتاحة الملف الحقيقي لجميع زوار موقعك حول العالم، ضع رابط تنزيل سحابي مباشر هنا.
              </p>
            </div>

            {/* What's New / Release Notes Editor */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ما الجديد في هذا التحديث (Release Notes)
              </label>
              <div className="space-y-2 mb-2">
                {whatsNewList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#0a1c42] border border-white/5 text-xs text-slate-200"
                  >
                    <span className="text-cyan-400 font-bold shrink-0">•</span>
                    <span className="flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add feature input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="أضف ميزة جديدة أو تحسين..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة
                </button>
              </div>
            </div>

            {/* Upload Progress Bar if processing */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30">
                <div className="flex justify-between text-xs text-cyan-300 mb-1.5 font-mono">
                  <span>{statusMessage}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Banner */}
            {isSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم حفظ وتفعيل النسخة بنجاح! يمكن للزوار الآن تنزيلها.</span>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToDownload}
                  className="text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  معاينة صفحة التنزيل
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isProcessing || !selectedFile
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_10px_25px_rgba(0,229,255,0.3)]'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              {isProcessing ? 'جاري رفع وحفظ النسخة...' : 'رفع ونشر النسخة على صفحة التنزيل'}
            </button>
          </form>
        </div>

        {/* Existing Releases & Management Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#081736] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                النسخ المسجلة ({releases.length})
              </h2>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="إعادة تعيين إلى النسخة الافتراضية"
              >
                <RefreshCw className="w-3 h-3" />
                استعادة الافتراضي
              </button>
            </div>

            <div className="space-y-3">
              {releases.map((rel) => {
                const isActive = rel.id === currentRelease.id;
                return (
                  <div
                    key={rel.id}
                    className={`p-4 rounded-2xl border transition-all text-right ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md'
                        : 'bg-[#0a1c42] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {rel.version}
                        </span>
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                            النسخة النشطة
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rel.fileSizeMb} MB
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono truncate mb-2" dir="ltr">
                      {rel.fileName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                      <span>{rel.releaseDate}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestDownload(rel)}
                          className="text-cyan-400 hover:text-cyan-300 p-1 flex items-center gap-1 cursor-pointer"
                          title="تجربة التحميل"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل</span>
                        </button>

                        {!isActive && (
                          <button
                            onClick={() => handleActivateRelease(rel)}
                            className="text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold cursor-pointer"
                          >
                            تفعيل
                          </button>
                        )}

                        {releases.length > 1 && (
                          <button
                            onClick={() => handleDeleteRelease(rel.id)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                            title="حذف النسخة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-5 rounded-2xl bg-[#06122c] border border-cyan-500/20 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              تخزين محلي مباشر وسريع
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-400">
              يتم حفظ حزم APK المرفوعة في التخزين الدائم للمتصفح (IndexedDB)، مما يتيح التنزيل الفوري للحزم الكبيرة بدون استهلاك إنترنت إضافي مع شريط تقدم واقعي ودقيق.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
