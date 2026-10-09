import React from 'react';
import { X, Check, AlertTriangle, ShieldCheck, Download, Settings, Play } from 'lucide-react';

interface InstallationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallationGuideModal: React.FC<InstallationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#091530] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-right overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" />
            دليل تثبيت حزمة أندرويد APK
          </div>
          <h2 className="text-2xl font-black text-white">
            كيفية تثبيت تطبيق شبكتي على هاتفك
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            خطوات بسيطة وسريعة لتثبيت التطبيق وتشغيله خلال أقل من دقيقة
          </p>
        </div>

        {/* Steps Grid */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4 p-4 rounded-2xl bg-[#0C1E45]/80 border border-white/10 items-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-semibold mb-0.5">الخطوة الأولى</div>
              <h3 className="text-base font-bold text-white mb-1">
                فتح ملف التحميل (Shabakati.apk)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                بعد اكتمال التنزيل، اضغط مباشرة على الإشعار في شريط التنبيهات، أو توجّه إلى تطبيق "ملفاتي" أو "التنزيلات" (Downloads) وانقر على الملف.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-4 rounded-2xl bg-[#0C1E45]/80 border border-white/10 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-amber-400 font-semibold mb-0.5">الخطوة الثانية</div>
              <h3 className="text-base font-bold text-white mb-1">
                السماح بالتثبيت من هذا المصدر (Unknown Sources)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                إذا ظهرت لك رسالة أمان النظام تفيد بأن التثبيت محظور من هذا المتصفح، اضغط على <strong>الإعدادات (Settings)</strong> ثم قم بتفعيل خيار <strong>"السماح بتثبيت التطبيقات من هذا المصدر"</strong>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-4 rounded-2xl bg-[#0C1E45]/80 border border-white/10 items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center shrink-0">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-semibold mb-0.5">الخطوة الثالثة</div>
              <h3 className="text-base font-bold text-white mb-1">
                تأكيد التثبيت وتشغيل تطبيق شبكتي
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                اضغط على زر <strong>"تثبيت" (Install)</strong>، انتظر ثوانٍ معدودة حتى تكتمل العملية، ثم انقر <strong>"فتح" (Open)</strong> واستمتع بجميع خدمات شبكتي الرقمية.
              </p>
            </div>
          </div>
        </div>

        {/* Security Assurance Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-start gap-3 text-xs text-cyan-200">
          <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>ملاحظة أمان:</strong> ملف APK لتطبيق شبكتي موقع رقمياً من قبل المطور الرسمي، وهو آمن بنسبة 100% ومفحوص ضد أي برمجيات خبيثة.
          </p>
        </div>

        {/* Close Action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            فهمت ذلك، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
