import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Smartphone, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  downloadUrl,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && downloadUrl) {
      QRCode.toDataURL(downloadUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#040B1C',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [isOpen, downloadUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#091530] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          المسح عبر كاميرا الهاتف للتنزيل
        </h2>
        <p className="text-xs text-slate-300 mb-6">
          وجّه كاميرا هاتفك الذكي نحو الرمز أدناه لفتح صفحة التنزيل المباشر فوراً
        </p>

        {/* QR Code Container */}
        <div className="inline-block p-4 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,229,255,0.25)] border-4 border-cyan-400 mb-6">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code للتنزيل المباشر"
              className="w-56 h-56 mx-auto block"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
              جاري توليد الرمز...
            </div>
          )}
        </div>

        {/* URL Box & Copy */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0C1E45] border border-white/10 text-xs">
          <input
            type="text"
            readOnly
            value={downloadUrl}
            className="flex-1 bg-transparent text-slate-300 font-mono text-[11px] outline-none text-left truncate"
            dir="ltr"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                نسخ الرابط
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
