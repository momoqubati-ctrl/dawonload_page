import React, { useState, useEffect } from 'react';
import {
  Download,
  QrCode,
  Smartphone,
  CheckCircle2,
  Check,
  Sparkles,
  Share2,
} from 'lucide-react';
import { ShabakatiLogo } from './components/ShabakatiLogo';
import { DownloadProgressWidget } from './components/DownloadProgressWidget';
import { InstallationGuideModal } from './components/InstallationGuideModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AppShowcase } from './components/AppShowcase';
import { AdminUploadPage } from './components/AdminUploadPage';
import {
  AdminLoginModal,
  getStoredAuth,
  clearStoredAuth,
} from './components/AdminLoginModal';
import { ApkRelease, PageView } from './types/apk';
import { getActiveRelease } from './utils/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('download');
  const [activeRelease, setActiveRelease] = useState<ApkRelease>(getActiveRelease());
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [adminClickCount, setAdminClickCount] = useState<number>(0);

  // Authentication State for Upload Panel Protection (Zero credentials leaks)
  const [isAuth, setIsAuth] = useState<boolean>(() => getStoredAuth().isAuthenticated);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const requestAdminView = () => {
    if (isAuth) {
      switchView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuth(true);
    setIsLoginModalOpen(false);
    switchView('admin');
  };

  const handleLogout = () => {
    clearStoredAuth();
    setIsAuth(false);
    switchView('download');
  };

  const handleSecretAdminClick = () => {
    setAdminClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        requestAdminView();
        return 0;
      }
      return next;
    });
    setTimeout(() => setAdminClickCount(0), 2500);
  };

  // Sync view from URL parameters if available and refresh active release
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const hasAdminFlag = params.has('admin');
    if (viewParam === 'admin' || hasAdminFlag) {
      if (getStoredAuth().isAuthenticated) {
        setCurrentView('admin');
      } else {
        setIsLoginModalOpen(true);
        setCurrentView('download');
      }
    } else if (viewParam === 'download') {
      setCurrentView('download');
    }
    const currentActive = getActiveRelease();
    setActiveRelease(currentActive);
  }, []);

  const switchView = (view: PageView) => {
    setCurrentView(view);
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'download');
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://shabakati.app';

  return (
    <div className="min-h-screen bg-[#040B1C] text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-cyan-500 selection:text-black">
      {/* ============================================================ */}
      {/* 1. Top Navigation Bar (Strict 3-Zone Contract)               */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#040B1C]/90 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand Wordmark / Logo */}
          <div
            onClick={() => switchView('download')}
            className="flex items-center gap-3 cursor-pointer select-none whitespace-nowrap shrink-0"
          >
            <ShabakatiLogo size="sm" showText={false} />
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>تطبيق شبكتي</span>
                <span className="text-xs text-cyan-400 font-semibold hidden sm:inline">للخدمات الرقمية</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono hidden md:block">
                الإصدار الرسمي {activeRelease.version}
              </div>
            </div>
          </div>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            {currentView === 'download' ? (
              <>
                <a
                  href="#download-section"
                  className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
                >
                  تنزيل التطبيق
                </a>
                <a
                  href="#services"
                  className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
                >
                  الخدمات الرقمية
                </a>
                <a
                  href="#specs"
                  className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
                >
                  المواصفات الفنية
                </a>
                <button
                  onClick={() => setIsInstallGuideOpen(true)}
                  className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  دليل التثبيت
                </button>
              </>
            ) : (
              <span className="text-cyan-400 font-bold whitespace-nowrap shrink-0">
                لوحة إدارة الحزم ورفع ملفات APK
              </span>
            )}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentView === 'download' ? (
              <a
                href="#download-section"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>تحميل التطبيق</span>
              </a>
            ) : (
              <button
                onClick={() => switchView('download')}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>صفحة التنزيل للزوار</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. Main Page Content                                         */}
      {/* ============================================================ */}
      <main className="flex-1">
        {currentView === 'admin' && isAuth ? (
          <AdminUploadPage
            currentRelease={activeRelease}
            onReleaseUpdated={(rel) => setActiveRelease(rel)}
            onSwitchToDownload={() => switchView('download')}
            onLogout={handleLogout}
          />
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-20">
            {/* Top Announcement Strip */}
            <div className="flex items-center justify-center gap-3 text-xs text-slate-300 mb-8 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                تحديث جديد متوفر الآن
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">الإصدار {activeRelease.version}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">حجم الحزمة {activeRelease.fileSizeMb} ميجابايت</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">بتاريخ {activeRelease.releaseDate}</span>
            </div>

            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-10">
              {/* App Logo Display with 3D Depth */}
              <div className="flex justify-center mb-6">
                <div className="relative p-2 rounded-[42px] bg-gradient-to-b from-cyan-500/30 via-transparent to-blue-600/20 shadow-[0_20px_60px_rgba(0,180,216,0.25)]">
                  <ShabakatiLogo size="xl" showText={false} />
                </div>
              </div>

              {/* Title & Headline */}
              <h1
                className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4"
                style={{ textWrap: 'balance' }}
              >
                تطبيق شبكتي للخدمات الرقمية
              </h1>

              <p
                className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
                style={{ textWrap: 'balance' }}
              >
                بوابتك المتخصصة لاشتراكات برامج الذكاء الاصطناعي، الكورسات التعليمية، منصات الأفلام والمسلسلات، وأدوات التصميم الاحترافية في تطبيق أندرويد واحد خفيف وسريع.
              </p>

              {/* Download Section with Progress Bar Widget */}
              <div id="download-section" className="mb-12">
                <DownloadProgressWidget
                  release={activeRelease}
                  onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
                  onDownloadCompleted={() => setIsInstallGuideOpen(true)}
                />
              </div>

              {/* Quick Action Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#091738] hover:bg-[#0c204d] border border-cyan-500/20 text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>مسح رمز QR للهاتف</span>
                </button>

                <button
                  onClick={() => setIsInstallGuideOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#091738] hover:bg-[#0c204d] border border-cyan-500/20 text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>طريقة التثبيت على أندرويد</span>
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="px-4 py-2 rounded-xl bg-[#091738] hover:bg-[#0c204d] border border-cyan-500/20 text-slate-200 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>تم نسخ رابط التنزيل</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      <span>مشاركة رابط التطبيق</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* What's New Box */}
            {activeRelease.whatsNew && activeRelease.whatsNew.length > 0 && (
              <div className="max-w-2xl mx-auto mb-16 p-6 rounded-2xl bg-[#071533] border border-cyan-500/30 text-right">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  ما الجديد في الإصدار {activeRelease.version}:
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeRelease.whatsNew.map((note, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Showcase & Specifications Section */}
            <div id="services">
              <div id="specs">
                <AppShowcase release={activeRelease} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 3. Footer                                                   */}
      {/* ============================================================ */}
      <footer className="mt-auto border-t border-cyan-500/20 bg-[#020712] py-8 text-xs text-slate-400 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShabakatiLogo size="sm" showText={false} />
            <div className="text-right">
              <div className="font-bold text-white text-sm">
                تطبيق شبكتي للخدمات الرقمية
              </div>
              <div
                onClick={handleSecretAdminClick}
                className="text-[11px] text-slate-400 select-none cursor-default"
              >
                جميع الحقوق محفوظة © {new Date().getFullYear()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => switchView('download')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              صفحة التنزيل
            </button>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <button
              onClick={() => setIsInstallGuideOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              دليل التثبيت
            </button>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <button
              onClick={requestAdminView}
              className="hover:text-cyan-400 transition-colors cursor-pointer text-slate-400"
            >
              لوحة الإدارة والرفع
            </button>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 4. Modals                                                   */}
      {/* ============================================================ */}
      <InstallationGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        downloadUrl={currentUrl}
      />

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => {
          setIsLoginModalOpen(false);
          switchView('download');
        }}
      />
    </div>
  );
}
