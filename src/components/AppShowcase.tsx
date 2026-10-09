import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Film,
  Palette,
  ShieldCheck,
  Cpu,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Lock,
} from 'lucide-react';
import { ApkRelease } from '../types/apk';

interface AppShowcaseProps {
  release: ApkRelease;
}

export const AppShowcase: React.FC<AppShowcaseProps> = ({ release }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const services = [
    {
      id: 'ai-tools',
      title: 'اشتراكات برامج الذكاء الاصطناعي',
      desc: 'حسابات واشتراكات مدفوعة لأقوى نماذج الذكاء الاصطناعي مثل ChatGPT Plus و Claude 3.5 Sonnet و Midjourney و Perplexity Pro و Gemini Advanced لتوليد النصوص والصور والأكواد البرمجية.',
      icon: Sparkles,
      accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      tag: 'ذكاء اصطناعي وتوليد رقمي',
    },
    {
      id: 'courses',
      title: 'الكورسات والدورات التعليمية',
      desc: 'اشتراكات منصات التعليم العالمية والعربية مثل Udemy و Coursera و Skillshare و LinkedIn Learning للوصول إلى آلاف الكورسات في البرمجة وإدارة الأعمال واللغات.',
      icon: GraduationCap,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      tag: 'منصات تدريبية وتعليمية',
    },
    {
      id: 'movies',
      title: 'منصات الأفلام والمسلسلات',
      desc: 'اشتراكات رسمية لأفضل منصات البث الترفيهي بما فيها Netflix و Shahid VIP و Disney+ و Prime Video و OSN+ بجودة 4K فائقة الوضوح مع دعم شاشات متعددة.',
      icon: Film,
      accent: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      tag: 'بث وترفيه سينمائي',
    },
    {
      id: 'design',
      title: 'برامج وأدوات التصميم والإنتاج',
      desc: 'اشتراكات Canva Pro الرسمية وحزم Adobe Creative Cloud (Photoshop, Premiere, Illustrator) وحسابات Figma Pro و Freepik Premium للمصممين وصناع المحتوى.',
      icon: Palette,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      tag: 'أدوات التصميم والجرافيك',
    },
  ];

  const faqs = [
    {
      q: 'هل تنزيل تطبيق شبكتي بصيغة APK آمن على جهازي؟',
      a: 'نعم، التطبيق آمن 100% ومفحوص دورياً ضد البرمجيات الضارة وموقع بشهادة أمان رقمية رسمية. يمكنك فحصه عبر Google Play Protect أو VirusTotal دون أي قلق.',
    },
    {
      q: 'لماذا يطلب الهاتف الإذن "تثبيت تطبيقات من مصادر غير معروفة"؟',
      a: 'هذا الإجراء القياسي في نظام أندرويد يظهر عند تثبيت أي تطبيق مباشرة من خارج متجر Google Play. يمكنك تفعيله بأمان لمتصفحك فقط والمتابعة دون أي خطر.',
    },
    {
      q: 'هل يتطلب تطبيق شبكتي صلاحيات الروت (Root)؟',
      a: 'لا، التطبيق يعمل بكامل مميزاته على جميع هواتف أندرويد العادية بدون أي روت أو تعديلات على نظام التشغيل، ويدعم إصدارات Android 6.0 فما فوق.',
    },
    {
      q: 'كيف يمكنني تحديث التطبيق عند صدور نسخة جديدة؟',
      a: 'يرسل التطبيق تنبيهاً تلقائياً عند توفر إصدار جديد، أو يمكنك زيارة هذه الصفحة دائماً لتنزيل أحدث حزمة APK بنقرة زر واحدة.',
    },
  ];

  return (
    <section className="w-full mt-20 pt-10 border-t border-cyan-500/20">
      {/* 1. Core Services Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          الخدمات الحصرية المتوفرة في هذا الإصدار
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ textWrap: 'balance' }}>
          اشتراكات الذكاء الاصطناعي، الكورسات، الأفلام والتصاميم
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          تم تخصيص هذا الإصدار من تطبيق شبكتي ليوفر حصرياً اشتراكات برامج الذكاء الاصطناعي، الدورات والكورسات التعليمية، منصات الأفلام والمسلسلات، وأدوات التصميم الاحترافية.
        </p>
      </div>

      {/* Services Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className="p-6 rounded-2xl bg-[#081736] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 group hover:-translate-y-1 text-right flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">
                    {s.tag}
                  </span>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${s.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>متوفر مباشرة داخل التطبيق</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Technical Specifications & Integrity Verification */}
      <div className="bg-[#07132e] border border-white/10 rounded-3xl p-6 sm:p-8 mb-16 text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              المواصفات الفنية لحزمة APK
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              بيانات الحزمة والتوقيع الرقمي المعتمد من شبكتي
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            حزمة رسمية موقّعة
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0a1c42] border border-white/5">
            <div className="text-slate-400 text-[11px] mb-1">اسم الحزمة (Package ID)</div>
            <div className="font-mono text-cyan-300 font-bold truncate" dir="ltr">
              {release.packageName}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a1c42] border border-white/5">
            <div className="text-slate-400 text-[11px] mb-1">رقم الإصدار والبناء</div>
            <div className="font-mono text-white font-bold">
              {release.version} (Build {release.buildNumber})
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a1c42] border border-white/5">
            <div className="text-slate-400 text-[11px] mb-1">الحد الأدنى للنظام</div>
            <div className="text-white font-bold">
              {release.minAndroid}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a1c42] border border-white/5">
            <div className="text-slate-400 text-[11px] mb-1">المعمارية المدعومة</div>
            <div className="text-white font-bold truncate">
              {release.architecture}
            </div>
          </div>
        </div>

        {/* SHA-256 Hash Display */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400 font-semibold">بصمة التشفير الرقمية (SHA-256):</span>
          <span className="font-mono text-cyan-300 truncate select-all" dir="ltr">
            {release.sha256}
          </span>
        </div>
      </div>

      {/* 3. Frequently Asked Questions (FAQ) */}
      <div className="max-w-3xl mx-auto mb-16 text-right">
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            الأسئلة الشائعة حول تثبيت التطبيق
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            إجابات واضحة لأكثر الاستفسارات شيوعاً عند تنزيل حزم أندرويد
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-[#081736] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-4.5 flex items-center justify-between text-right font-bold text-sm text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
