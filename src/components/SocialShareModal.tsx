import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Button } from './Button';
import { CampaignSettings, AppLanguage } from '../types';
import { createCompositeImage } from '../services/canvasService';
import { TRANSLATIONS } from '../translations';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  defaultCaption?: string;
  showWatermark?: boolean;
  campaignSettings?: CampaignSettings;
  watermarkPosition: { x: number; y: number };
  language: AppLanguage;
}

type DownloadFormat = 'png' | 'jpg' | 'webp';

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  defaultCaption = '',
  showWatermark = false,
  campaignSettings,
  watermarkPosition,
  language
}) => {
  const t = (key: string) => {
    // @ts-ignore
    return TRANSLATIONS[language][key] || key;
  };
  
  const [caption, setCaption] = useState(defaultCaption);
  const [isSharing, setIsSharing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [waFeedback, setWaFeedback] = useState(false);
  const [exportingPlatform, setExportingPlatform] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('png');

  useEffect(() => {
    setCaption(defaultCaption);
    setWaFeedback(false);
  }, [defaultCaption, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(caption);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    } catch (e) {
        console.error(e);
    }
  };

  /**
   * Converts data URL to a File object.
   */
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    // Using globalThis.File to ensure browser File is used
    return new globalThis.File([u8arr], filename, { type: mime });
  };

  const handleNativeShare = async () => {
    if (navigator.share && imageSrc) {
        setIsSharing(true);
        try {
            const file = dataURLtoFile(imageSrc, 'studioplay-share.png');
            await navigator.share({
                title: 'StudioPlay AI Design',
                text: caption,
                files: [file]
            });
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    } else {
        alert('Browser does not support native share.');
    }
  };

  const handleWhatsApp = async () => {
      const file = dataURLtoFile(imageSrc, 'studioplay-image.png');
      const waUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;

      // 1. Mobile Strategy: Native Share
      if (navigator.canShare && (navigator as any).canShare({ files: [file] })) {
          try {
              await navigator.share({
                  files: [file],
                  text: caption,
                  title: 'Share to WhatsApp'
              });
              return; 
          } catch (e) {
              console.log("Native share failed or cancelled, falling back to desktop strategy");
          }
      }

      // 2. Desktop Strategy
      try {
          const response = await fetch(imageSrc);
          // Use globalThis.Blob to avoid potential shadowing issues with @google/genai Blob
          const blobData: globalThis.Blob = await response.blob();
          await (navigator.clipboard as any).write([
              new (window as any).ClipboardItem({ [blobData.type]: blobData })
          ]);
          setWaFeedback(true);
          window.open(waUrl, '_blank');
      } catch (e) {
          console.error("Clipboard copy failed", e);
          window.open(waUrl, '_blank');
      }
  };

  const downloadDirect = async (clean: boolean) => {
      let url = imageSrc;
      
      // 1. Generate Composite if needed (text/watermark)
      if (!clean && campaignSettings && (campaignSettings.showText || showWatermark)) {
          try {
              url = await createCompositeImage(imageSrc, campaignSettings, showWatermark, watermarkPosition);
          } catch (e) {
              console.error("Error creating composite for download", e);
          }
      }

      // 2. Convert Format if needed (JPG/WebP)
      if (downloadFormat !== 'png') {
          try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.src = url;
              await new Promise((resolve) => { img.onload = resolve; });
              
              canvas.width = img.width;
              canvas.height = img.height;
              
              if (ctx) {
                  // JPG needs a white background (default is transparent black)
                  if (downloadFormat === 'jpg') {
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                  }
                  
                  ctx.drawImage(img, 0, 0);
                  
                  const mimeType = downloadFormat === 'jpg' ? 'image/jpeg' : 'image/webp';
                  url = canvas.toDataURL(mimeType, 0.9);
              }
          } catch (e) {
              console.error("Error converting format", e);
          }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `studioplay-${clean ? 'clean' : 'design'}-${Date.now()}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleSmartExport = async (platform: string, width: number, height: number) => {
    setExportingPlatform(platform);
    
    try {
        // 1. Prepare Source Image (Flatten text if needed)
        let sourceUrl = imageSrc;
        if (campaignSettings?.showText) {
             sourceUrl = await createCompositeImage(imageSrc, campaignSettings, false, {x:0, y:0});
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = sourceUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 2. Draw Blurred Background (Ambience)
        const scaleCover = Math.max(width / img.width, height / img.height);
        const bgW = img.width * scaleCover;
        const bgH = img.height * scaleCover;
        const bgX = (width - bgW) / 2;
        const bgY = (height - bgH) / 2;

        ctx.filter = 'blur(40px) brightness(0.7)';
        ctx.drawImage(img, bgX, bgY, bgW, bgH);
        
        ctx.filter = 'none';

        // 3. Draw Main Image (Contain)
        const padding = 0.90;
        const scaleFit = Math.min(width / img.width, height / img.height) * padding;
        const mainW = img.width * scaleFit;
        const mainH = img.height * scaleFit;
        const mainX = (width - mainW) / 2;
        const mainY = (height - mainH) / 2;

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 20;

        ctx.drawImage(img, mainX, mainY, mainW, mainH);

        // 4. Apply Watermark if enabled
        if (showWatermark) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            const fontSize = Math.max(20, Math.round(width * 0.025)); 
            ctx.font = `bold ${fontSize}px Heebo, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            
            const paddingX = width * 0.04;
            const paddingY = height * 0.04;
            
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText('StudioPlay AI', width - paddingX, height - paddingY);
        }

        const link = document.createElement('a');
        const exportMime = downloadFormat === 'jpg' ? 'image/jpeg' : (downloadFormat === 'webp' ? 'image/webp' : 'image/png');
        link.download = `studioplay-${platform}-${Date.now()}.${downloadFormat}`;
        link.href = canvas.toDataURL(exportMime, 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        console.error("Export failed", e);
        alert("Error exporting image");
    } finally {
        setExportingPlatform(null);
    }
  };

  const FORMATS: {id: DownloadFormat, label: string}[] = [
      { id: 'png', label: 'formatPng' },
      { id: 'jpg', label: 'formatJpg' },
      { id: 'webp', label: 'formatWebp' }
  ];

  const RATIOS = [
      { id: 'sq', label: 'Square (1:1)', w: 1080, h: 1080, icon: <Icons.Instagram className="w-4 h-4"/> },
      { id: 'st', label: 'Story (9:16)', w: 1080, h: 1920, icon: <Icons.Tiktok className="w-4 h-4"/> },
      { id: 'ls', label: 'Landscape (16:9)', w: 1920, h: 1080, icon: <Icons.Youtube className="w-4 h-4"/> },
      { id: 'pt', label: 'Portrait (4:5)', w: 1080, h: 1350, icon: <Icons.Layout className="w-4 h-4"/> },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
        
        {waFeedback && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-[70] text-center animate-in slide-in-from-top-4 border border-green-400 max-w-sm">
                <div className="text-2xl mb-2">✅</div>
                <p className="font-bold text-lg mb-1">{t('messageReady')}</p>
                <p className="text-sm opacity-90 mb-3">
                    {t('messageReadyDesc')}
                </p>
                <button onClick={() => setWaFeedback(false)} className="text-xs bg-white/20 px-3 py-1 rounded-full">{t('gotIt')}</button>
            </div>
        )}

        <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-slate-900 shrink-0">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg">
                        <Icons.Share />
                    </div>
                    {t('shareExport')}
                </h3>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <Icons.X />
                </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border border-white/10 bg-slate-800 flex-shrink-0 mx-auto md:mx-0">
                        <img src={imageSrc} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={t('writeCaption')}
                        className="flex-1 h-24 md:h-auto bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:border-purple-500 outline-none placeholder:text-slate-600 custom-scrollbar"
                    />
                </div>

                <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{t('chooseFormat')}</h4>
                    <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {FORMATS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setDownloadFormat(f.id)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${downloadFormat === f.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {t(f.label)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{t('downloadOptions')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => downloadDirect(true)}
                            className="bg-slate-800 hover:bg-slate-700 border border-white/5 p-4 rounded-xl flex items-center justify-center gap-3 transition-all"
                        >
                            <Icons.Image className="w-5 h-5 text-slate-400" />
                            <span className="font-bold text-sm">{t('downloadClean')}</span>
                        </button>
                        <button 
                            onClick={() => downloadDirect(false)}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
                        >
                            <Icons.Star className="w-5 h-5" />
                            <span className="font-bold text-sm">{t('downloadDesign')}</span>
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{t('downloadResized')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {RATIOS.map(r => (
                            <button 
                                key={r.id}
                                onClick={() => handleSmartExport(r.id, r.w, r.h)}
                                disabled={!!exportingPlatform}
                                className="bg-slate-800 hover:bg-slate-700 border border-white/5 p-3 rounded-xl flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                            >
                                <span className={`p-2 rounded-lg ${exportingPlatform === r.id ? 'bg-white text-black animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
                                    {r.icon}
                                </span>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-white">{r.label}</div>
                                    <div className="text-[10px] text-slate-500">{r.w}x{r.h}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{t('directShare')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleNativeShare}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-900/30"
                        >
                            <Icons.Share />
                            Share (Mobile)
                        </button>
                        
                        <button 
                            onClick={handleWhatsApp}
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
                        >
                            <Icons.Whatsapp />
                            WhatsApp
                        </button>

                        <button 
                            onClick={handleCopy}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 col-span-2"
                        >
                            <Icons.Copy />
                            {copyFeedback ? t('copied') : t('copyText')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SocialShareModal;